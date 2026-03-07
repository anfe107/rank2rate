<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button @click="router.push(`/sessions/${sessionId}`)" class="text-slate-500 hover:text-slate-800 text-sm">
        ← Drag & Drop Gruppierung
      </button>
      <span v-if="session" class="text-sm text-slate-500">
        {{ session.title }} · {{ projects.length }} Abgaben · {{ groups.length }} Gruppen
      </span>
    </header>

    <!-- Ladeanimation -->
    <div v-if="loading" class="flex items-center justify-center h-64 text-slate-400">Lädt …</div>

    <div v-else class="max-w-2xl mx-auto px-4 py-6 space-y-4">

      <!-- Pool: Noch zuzuweisen -->
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-medium text-slate-700">
            Noch zuzuweisen ({{ pool.length }})
          </h2>
          <button
            v-if="session?.anonymized"
            @click="showAllNames = !showAllNames"
            class="text-xs text-slate-500 hover:text-blue-600 dd-no-drag"
          >
            {{ showAllNames ? 'Namen verbergen' : 'Klarnamen anzeigen' }}
          </button>
        </div>

        <div
          id="dd-pool"
          class="min-h-16 flex flex-wrap gap-2"
          :class="pool.length === 0 ? 'border-2 border-dashed border-slate-200 rounded-lg' : ''"
        >
          <div
            v-for="p in pool"
            :key="p._id"
            :data-id="p._id"
            class="bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700 cursor-grab select-none"
          >
            {{ p.displayName }}
            <span v-if="session?.anonymized && revealedNames[p._id]" class="block text-xs text-slate-500">
              {{ p.actualName }}
            </span>
            <button
              v-if="session?.anonymized"
              :data-testid="`toggle-name-${p._id}`"
              @click="toggleName(p._id)"
              class="dd-no-drag ml-1 text-slate-400 hover:text-slate-600 text-xs"
            >👁</button>
          </div>
        </div>
      </div>

      <!-- Gruppen -->
      <div
        v-for="(group, gi) in groups"
        :key="group.label"
        class="bg-white border border-slate-200 rounded-xl p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-slate-700 uppercase text-sm tracking-wide">{{ group.label }}</h3>
          <span class="text-xs text-slate-400">{{ group.items.length || 'leer' }}</span>
        </div>
        <div
          :id="`dd-group-${gi}`"
          class="min-h-12 flex flex-wrap gap-2"
          :class="group.items.length === 0 ? 'border-2 border-dashed border-slate-200 rounded-lg' : ''"
        >
          <div
            v-for="p in group.items"
            :key="p._id"
            :data-id="p._id"
            class="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800 cursor-grab select-none"
          >
            {{ p.displayName }}
            <span v-if="session?.anonymized && revealedNames[p._id]" class="block text-xs text-blue-600">
              {{ p.actualName }}
            </span>
            <button
              v-if="session?.anonymized"
              :data-testid="`toggle-name-${p._id}`"
              @click="toggleName(p._id)"
              class="dd-no-drag ml-1 text-blue-400 hover:text-blue-600 text-xs"
            >👁</button>
          </div>
        </div>
      </div>

      <!-- Fehlermeldung -->
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <!-- Speichern -->
      <div class="pt-2">
        <p v-if="pool.length > 0" class="text-xs text-slate-400 mb-2">
          Noch {{ pool.length }} Abgabe(n) zuzuweisen
        </p>
        <button
          data-testid="save"
          :disabled="pool.length > 0 || saving"
          @click="save"
          class="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Speichern …' : 'Ergebnis speichern →' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Sortable from 'sortablejs'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sessionId = route.params.id

const GROUP_LABELS_3 = ['Top', 'Mittelfeld', 'Untere Gruppe']
const GROUP_LABELS_5 = ['Herausragend', 'Sehr gut', 'Gut', 'Ausreichend', 'Nicht ausreichend']

const session = shallowRef(null)
const projects = ref([])
const pool = ref([])
const groups = ref([])
const revealedNames = ref({})
const showAllNames = ref(false)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

function toggleName(id) {
  revealedNames.value[id] = !revealedNames.value[id]
}

// Für Tests: Pool leeren und alle Items in erste Gruppe verschieben
function emptyPoolForTest() {
  const remaining = [...pool.value]
  pool.value = []
  if (groups.value.length > 0) {
    groups.value[0].items.push(...remaining)
  }
}

defineExpose({ pool, groups, emptyPoolForTest })

function initSortable() {
  const poolEl = document.getElementById('dd-pool')
  if (!poolEl) return

  const sortableOptions = {
    group: 'dd',
    draggable: '[data-id]',
    filter: '.dd-no-drag',
    preventOnFilter: false,
    sort: false,
    emptyInsertThreshold: 60,
    onEnd(evt) {
      const id = evt.item.getAttribute('data-id')
      const project = projects.value.find(p => p._id === id)
      if (!project) return

      // Pflichtschritt: DOM-Element entfernen bevor Vue-State aktualisiert wird
      evt.item.remove()

      const fromPool = evt.from.id === 'dd-pool'
      const toPool = evt.to.id === 'dd-pool'
      const fromGroupIdx = evt.from.id.startsWith('dd-group-') ? parseInt(evt.from.id.replace('dd-group-', '')) : -1
      const toGroupIdx = evt.to.id.startsWith('dd-group-') ? parseInt(evt.to.id.replace('dd-group-', '')) : -1

      // Aus Quelle entfernen
      if (fromPool) {
        pool.value = pool.value.filter(p => p._id !== id)
      } else if (fromGroupIdx >= 0) {
        groups.value[fromGroupIdx].items = groups.value[fromGroupIdx].items.filter(p => p._id !== id)
      }

      // In Ziel einfügen
      if (toPool) {
        pool.value.push(project)
      } else if (toGroupIdx >= 0) {
        groups.value[toGroupIdx].items.push(project)
      }
    },
  }

  Sortable.create(poolEl, sortableOptions)
  groups.value.forEach((_, gi) => {
    const el = document.getElementById(`dd-group-${gi}`)
    if (el) Sortable.create(el, sortableOptions)
  })
}

async function load() {
  try {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      headers: auth.authHeader(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    session.value = data.session
    projects.value = data.projects

    const labels = data.session.groupCount === 5 ? GROUP_LABELS_5 : GROUP_LABELS_3
    groups.value = labels.map(label => ({ label, items: [] }))

    if (data.session.groupingResult?.length) {
      // Vorhandenes Ergebnis wiederherstellen
      const byId = Object.fromEntries(data.projects.map(p => [p._id, p]))
      data.session.groupingResult.forEach((g, i) => {
        if (groups.value[i]) {
          groups.value[i].items = g.projectIds.map(id => byId[id]).filter(Boolean)
        }
      })
      const assigned = new Set(data.session.groupingResult.flatMap(g => g.projectIds))
      pool.value = data.projects.filter(p => !assigned.has(p._id))
    } else {
      pool.value = [...data.projects]
    }
  } catch (e) {
    error.value = e.message
  } finally {
    // Pflichtschritt: loading ZUERST false setzen, dann nextTick, dann Sortable initialisieren
    loading.value = false
    await nextTick()
    initSortable()
  }
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    const groupsPayload = groups.value.map(g => ({
      label: g.label,
      projectIds: g.items.map(p => p._id),
    }))
    const res = await fetch(`/api/sessions/${sessionId}/grouping`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...auth.authHeader() },
      body: JSON.stringify({ groups: groupsPayload }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    router.push(`/sessions/${sessionId}/results`)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
