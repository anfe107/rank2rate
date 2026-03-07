# Lessons Learned: Sortable.js + Vue Virtual DOM

> Erarbeitet aus der Implementierung von Feature 1.3 (Drag & Drop Gruppierung) und den anschliessenden Bugfixes.

---

## Das Kernproblem

Sortable.js und Vues Virtual DOM kaempfen um dieselben DOM-Elemente.

Sortable.js operiert direkt auf dem echten DOM: Es verschiebt Elemente physisch beim Drag & Drop. Vue kennt diesen Eingriff nicht – beim naechsten Re-Render versucht Vue, seinen erwarteten virtuellen DOM-Zustand mit dem echten DOM abzugleichen (Reconciliation). Das Ergebnis: Elemente verschwinden, verdoppeln sich, oder tauchen an falscher Stelle auf. Abgaben konnten nicht in Gruppen gezogen werden – sie sprangen zurueck oder wurden doppelt angezeigt.

---

## Die Loesung: DOM-Hoheit klar aufteilen

**Grundprinzip:** Sortable bewegt das Element, Vue rendert es danach neu an der richtigen Stelle. Niemals beide gleichzeitig.

### 1. Sortable-Element nach dem Drop sofort entfernen (`evt.item.remove()`)

```js
onEnd(evt) {
  if (evt.from === evt.to) return

  // WICHTIG: Attribute lesen BEVOR das Element entfernt wird
  const projectId = evt.item.dataset.id
  const toGroupIndex = evt.to.dataset.groupIndex

  // Sortable hat das Element schon verschoben. Wir entfernen es,
  // damit Vue beim Re-Render einen sauberen Zustand vorfindet.
  // (Sonst kaempfen Vue-Reconciliation und Sortable um dasselbe Element.)
  evt.item.remove()

  // Reaktiven State updaten → Vue rendert das Element neu an der richtigen Stelle
  dd.value.moveToGroup(projectId, parseInt(toGroupIndex))
},
```

**Warum:** Sortable hat das DOM-Element bereits physisch bewegt. Wenn Vue jetzt re-rendert, findet es das Element an einer Stelle vor, die es nicht erwartet. Durch `evt.item.remove()` uebergeben wir Vue einen sauberen DOM – Vue rendert das Item dann korrekt basierend auf dem reaktiven State.

### 2. Initialisierungs-Timing: loading VOR nextTick setzen

```js
async function load() {
  // ...
  loading.value = false          // (1) loading aus → Vue rendert die UI
  // }  ← finally-Block endet hier

  if (session.value && dd.value) {
    await nextTick()             // (2) warten, bis Vue das DOM aufgebaut hat
    initSortable()               // (3) JETZT erst Sortable an die echten DOM-Elemente binden
  }
}
```

**Warum:** `initSortable()` braucht echte DOM-Elemente (`getElementById`). Wird es vor `nextTick()` aufgerufen, gibt `getElementById` `null` zurueck, weil Vue noch nicht gerendert hat. Der Trick: `loading.value = false` ausserhalb des `finally`-Blocks setzen, damit Vue zuerst die UI rendert, dann `await nextTick()`, dann initialisieren.

### 3. `shallowRef` statt `ref` fuer session und loading

```js
const session = shallowRef(null)
const loading = shallowRef(true)
const dd = shallowRef(null)
```

**Warum:** Tiefe Reaktivitaet (`ref`) auf grossen Datenobjekten ist teuer und kann unbeabsichtigte Re-Renders ausloesen. `shallowRef` beobachtet nur die oberste Ebene – ausreichend, weil der interne State des Composables (`pool`, `groups`) selbst reaktiv ist.

---

## Weitere wichtige Sortable.js-Konfiguration

### 4. `draggable: '[data-id]'` – nur Projekt-Kacheln sind ziehbar

```js
draggable: '[data-id]',
```

Der Gruppen-Titel (`<p>`) liegt innerhalb des Sortable-Containers, hat aber kein `data-id`-Attribut. Sortable ignoriert ihn dadurch automatisch. Ohne diese Option wuerden alle Kind-Elemente ziehbar sein, inklusive des Titels.

### 5. `filter: '.dd-no-drag'` + `preventOnFilter: false` – Eye-Button klickbar lassen

```js
filter: '.dd-no-drag',
preventOnFilter: false,
```

Das Eye-Icon (Anonymisierungs-Toggle) liegt innerhalb der ziehbaren Kachel. Ohne `filter` startet ein Klick darauf einen Drag. `filter: '.dd-no-drag'` verhindert den Drag. `preventOnFilter: false` stellt sicher, dass der Click-Event trotzdem durchkommt – sonst haette der Button gar nicht reagiert.

### 6. `emptyInsertThreshold: 60` – Drop in leere Container ermoeglichen

```js
emptyInsertThreshold: 60,
```

Der Sortable-Default (5px) ist zu klein: Leere Gruppen-Container haben keine Items, auf die man zielen koennte. Mit 60px erkennt Sortable den Drop auch in einen vollstaendig leeren Container.

### 7. `sort: false` – keine Umsortierung innerhalb einer Liste

```js
sort: false,
```

Innerhalb von Pool oder Gruppe soll die Reihenfolge keine Rolle spielen. `sort: false` verhindert, dass Sortable versucht, die Reihenfolge zu managen – das vereinfacht die Vue-Reconciliation.

---

## Anti-Patterns (was nicht funktioniert)

| Ansatz | Problem |
|--------|---------|
| `v-model` oder `:key` auf Sortable-Containern ohne `evt.item.remove()` | Vue und Sortable ueberschreiben sich gegenseitig; Items springen zurueck |
| `initSortable()` direkt in `onMounted` ohne `nextTick` | DOM existiert noch nicht, `getElementById` gibt `null` zurueck, keine Sortable-Bindung |
| `loading = false` erst nach `await nextTick()` | Vue rendert erst nach `initSortable()` – DOM-Elemente noch nicht vorhanden |
| `ref()` statt `shallowRef()` auf Session-Objekt | Tiefe Reaktivitaet loest ungewollte Re-Renders aus, die mit Sortable kollidieren |
| Drag-Container ohne `draggable`-Selektor | Nicht-ziehbare Elemente (Titel, Buttons) werden ziehbar |

---

## Architekturprinzip fuer kuenftige Sortable.js-Integration

```
Sortable.onEnd:
  1. Lies alle Daten vom DOM (evt.item.dataset.*), BEVOR du etwas aenderst
  2. Entferne das DOM-Element (evt.item.remove())
  3. Update den reaktiven Vue-State

Vue-Reaktivitaet:
  4. Rendert das Element neu an der korrekten Position

Niemals:
  - Sortable und Vue gleichzeitig dasselbe Element manipulieren lassen
  - initSortable() vor nextTick() aufrufen
```

---

## Betroffene Dateien in rank2rate

- `frontend/src/views/DragDropEvaluateView.vue` – Hauptimplementierung
- `frontend/src/composables/useDragDropState.js` – Reaktiver State (pool, groups, moveToGroup, moveToPool)
