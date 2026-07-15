<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button @click="router.push(`/sessions/${sessionId}`)" class="text-slate-500 hover:text-slate-800 text-sm">
        ← Session verwalten
      </button>
      <h1 class="font-semibold text-slate-800">
        {{ phase === 'ranking' ? 'Reihungsergebnis' : phase === 'grading' ? 'Notenvorschlag' : 'Noten festgelegt ✓' }}
      </h1>
    </header>

    <!-- Tabs -->
    <div v-if="phase !== 'done'" class="bg-white border-b border-slate-200 px-4 flex gap-6">
      <button
        class="py-3 text-sm font-medium border-b-2 transition-colors"
        :class="phase === 'ranking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'"
        @click="phase = 'ranking'"
      >Reihung</button>
      <button
        class="py-3 text-sm font-medium border-b-2 transition-colors"
        :class="phase === 'grading' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'"
        @click="session?.groupingResult?.length && (phase = 'grading')"
      >Notenvorschlag</button>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64 text-slate-400">Lädt …</div>

    <div v-else class="max-w-2xl mx-auto px-4 py-6 space-y-4">

      <!-- ── Schritt 1: Reihungsergebnis ── -->
      <template v-if="phase === 'ranking'">
        <!-- Globaler Klarnamen-Toggle -->
        <div v-if="session.anonymized" class="flex justify-end">
          <button
            @click="showAllNames = !showAllNames"
            class="text-xs text-slate-500 hover:text-blue-600"
          >
            {{ showAllNames ? 'Namen verbergen' : 'Klarnamen anzeigen' }}
          </button>
        </div>

        <div
          v-for="group in session.groupingResult"
          :key="group.label"
          class="bg-white border border-slate-200 rounded-xl p-4"
        >
          <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            {{ group.label }}
            <span class="text-slate-400 font-normal normal-case ml-1">({{ group.projectIds.length }})</span>
          </h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="pid in group.projectIds"
              :key="pid"
              class="bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700"
            >
              {{ projectById(pid)?.displayName }}
              <span v-if="session.anonymized && projectById(pid)?.actualName" class="flex items-center gap-1 mt-0.5">
                <button
                  @click="toggleName(pid)"
                  class="text-slate-400 hover:text-slate-600"
                >
                  <component :is="(showAllNames || revealedNames[pid]) ? EyeOff : Eye" class="w-3 h-3" />
                </button>
                <span class="text-xs text-slate-400 min-w-20">
                  {{ (showAllNames || revealedNames[pid]) ? projectById(pid)?.actualName : '••••••••' }}
                </span>
              </span>
            </div>
            <span v-if="group.projectIds.length === 0" class="text-sm text-slate-400 italic">leer</span>
          </div>
        </div>

        <!-- Zwei gleichwertige Abschlussoptionen -->
        <div class="space-y-3">
          <button
            data-testid="finish-ranking"
            @click="router.push('/dashboard')"
            class="w-full bg-white border border-slate-300 text-slate-700 rounded-lg py-2 text-sm font-medium hover:bg-slate-50"
          >
            Reihung abschließen
          </button>
          <p class="text-xs text-slate-400 text-center -mt-1">Ranking als Ergebnis speichern</p>

          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span class="flex-1 border-t border-slate-200"></span>
            <span>oder</span>
            <span class="flex-1 border-t border-slate-200"></span>
          </div>

          <button
            data-testid="to-grading"
            @click="phase = 'grading'"
            class="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
          >
            Noten ableiten →
          </button>
          <p class="text-xs text-slate-400 text-center -mt-1">Ranking in Notenvorschläge überführen</p>
        </div>
      </template>

      <!-- ── Schritt 2: Notenvorschlag ── -->
      <template v-else-if="phase === 'grading'">
        <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <h3 class="text-sm font-semibold text-slate-700">Notenskala</h3>
          <div>
            <label class="block text-xs text-slate-500 mb-1">Notensystem</label>
            <select
              v-model="selectedSystem"
              data-testid="grade-system-select"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option v-for="(sys, key) in GRADE_SYSTEMS" :key="key" :value="key">{{ sys.label }}</option>
            </select>
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs text-slate-500 mb-1">Beste Note</label>
              <select
                v-model="gradeMin"
                data-testid="grade-min-select"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option :value="null">{{ currentGrades[0] }} (Standard)</option>
                <option
                  v-for="g in currentGrades.slice(0, gradeMax !== null ? currentGrades.indexOf(gradeMax) + 1 : currentGrades.length)"
                  :key="g"
                  :value="g"
                >{{ g }}</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-slate-500 mb-1">Schlechteste Note</label>
              <select
                v-model="gradeMax"
                data-testid="grade-max-select"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option :value="null">{{ currentGrades[currentGrades.length - 1] }} (Standard)</option>
                <option
                  v-for="g in currentGrades.slice(gradeMin !== null ? currentGrades.indexOf(gradeMin) : 0)"
                  :key="g"
                  :value="g"
                >{{ g }}</option>
              </select>
            </div>
          </div>
          <p v-if="effectiveGrades.length < (session?.groupingResult?.length ?? 0)" class="text-xs text-amber-600">
            Weniger Notenstufen ({{ effectiveGrades.length }}) als Gruppen ({{ session.groupingResult.length }}) — mehrere Gruppen erhalten dieselbe Note.
          </p>
        </div>

        <!-- Vorschau -->
        <div class="bg-white border border-slate-200 rounded-xl p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Vorschau</h3>
          <div class="space-y-2">
            <div
              v-for="entry in gradePreview"
              :key="entry.projectId"
              :data-testid="`grade-row`"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2">
                <span
                  class="font-mono text-xs px-2 py-0.5 rounded"
                  :class="entry.isManual ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ entry.isManual ? `Note: ${entry.finalGrade}` : `Vorschlag: ${entry.finalGrade}` }}
                </span>
                <span class="text-slate-700">
                  {{ projectById(entry.projectId)?.displayName }}
                  <span v-if="session.anonymized && projectById(entry.projectId)?.actualName" class="inline-flex items-center gap-1 ml-1">
                    <button
                      @click="toggleName(entry.projectId)"
                      class="text-slate-400 hover:text-slate-600"
                    >
                      <component :is="(showAllNames || revealedNames[entry.projectId]) ? EyeOff : Eye" class="w-3 h-3" />
                    </button>
                    <span class="text-xs text-slate-400">
                      {{ (showAllNames || revealedNames[entry.projectId]) ? projectById(entry.projectId)?.actualName : '••••••••' }}
                    </span>
                  </span>
                </span>
                <span
                  v-if="entry.isManual"
                  :data-testid="`manual-mark-${entry.projectId}`"
                  class="text-amber-500 text-xs"
                  title="Manuell angepasst"
                >✎</span>
              </div>
              <select
                :data-testid="`override-${entry.projectId}`"
                :value="entry.finalGrade"
                @change="overrideGrade(entry.projectId, $event.target.value)"
                class="border border-slate-200 rounded text-xs px-1 py-0.5 text-slate-600"
              >
                <option v-for="g in GRADE_SYSTEMS[selectedSystem].grades" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Kontextnotiz -->
        <div class="bg-white border border-slate-200 rounded-xl p-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Notiz zur Benotung (optional)</label>
          <textarea
            v-model="gradingNote"
            data-testid="grading-note"
            placeholder="z.B. &quot;Klasse insgesamt schwach, Noten angehoben&quot;"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            rows="2"
          ></textarea>
        </div>

        <!-- Reflexionspflicht: Checkbox (nur wenn 0 manuelle Änderungen) -->
        <label
          v-if="manualCount === 0"
          data-testid="confirm-checkbox-label"
          class="flex items-start gap-2 text-sm text-slate-600 cursor-pointer"
        >
          <input
            type="checkbox"
            v-model="confirmed"
            data-testid="confirm-checkbox"
            class="mt-0.5 accent-blue-600"
          />
          <span>Ich habe die vorgeschlagene Notenverteilung geprüft und halte sie für angemessen.</span>
        </label>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          data-testid="save-rating"
          :disabled="!canSave || saving"
          @click="saveRating"
          class="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40"
        >
          {{ saving ? 'Übernehmen …' : 'Noten übernehmen' }}
        </button>
        <p
          v-if="!canSave && !saving"
          class="text-xs text-slate-400 text-center"
        >Bitte Notenverteilung prüfen: mindestens eine Note anpassen oder Bestätigung anhaken.</p>
      </template>

      <!-- ── Abschlussansicht ── -->
      <template v-else-if="phase === 'done'">
        <div class="bg-white border border-slate-200 rounded-xl p-4">
          <p v-if="manualCount > 0" class="text-sm text-slate-500 mb-1">
            {{ manualCount }} manuell angepasst
          </p>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b border-slate-100">
                <th class="pb-2">Abgabe</th>
                <th class="pb-2">Note</th>
                <th class="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in savedGrades"
                :key="entry.projectId"
                class="border-b border-slate-50"
              >
                <td class="py-2">
                  {{ projectById(entry.projectId)?.displayName }}
                  <span v-if="session.anonymized && projectById(entry.projectId)?.actualName" class="inline-flex items-center gap-1 ml-1">
                    <button
                      @click="toggleName(entry.projectId)"
                      class="text-slate-400 hover:text-slate-600"
                    >
                      <component :is="(showAllNames || revealedNames[entry.projectId]) ? EyeOff : Eye" class="w-3 h-3" />
                    </button>
                    <span class="text-xs text-slate-400">
                      {{ (showAllNames || revealedNames[entry.projectId]) ? projectById(entry.projectId)?.actualName : '••••••••' }}
                    </span>
                  </span>
                </td>
                <td class="py-2 font-mono">{{ entry.finalGrade }}</td>
                <td class="py-2 text-amber-500">{{ entry.finalGrade !== entry.computedGrade ? '✎' : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Hinweisbox bei 0 manuellen Änderungen -->
        <div
          v-if="allGradesUnchanged"
          data-testid="all-unchanged-hint"
          class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2"
        >
          <span>ℹ</span>
          <span>Alle Noten entsprechen dem Algorithmus-Vorschlag. Bitte prüfen, ob die Verteilung der Klassenleistung entspricht.</span>
        </div>

        <!-- Kontextnotiz anzeigen -->
        <p
          v-if="savedNote"
          data-testid="saved-note"
          class="text-sm text-slate-600 italic"
        >Notiz: {{ savedNote }}</p>

        <button
          @click="router.push('/dashboard')"
          class="w-full bg-slate-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700"
        >
          ← Dashboard
        </button>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sessionId = route.params.id

const GRADE_SYSTEMS = {
  schulnoten: { label: 'Schulnoten 1–6', grades: [1, 2, 3, 4, 5, 6] },
  abitur:     { label: 'Abiturpunkte 0–15', grades: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] },
  letter:     { label: 'A–F', grades: ['A', 'B', 'C', 'D', 'F'] },
  percent:    { label: 'Prozent', grades: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0] },
}

const session = ref(null)
const projects = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const phase = ref('ranking') // 'ranking' | 'grading' | 'done'
const revealedNames = ref({})
const showAllNames = ref(false)

function toggleName(id) {
  revealedNames.value[id] = !revealedNames.value[id]
}

const selectedSystem = ref('schulnoten')
const gradeMin = ref(null) // index into current system's grades array
const gradeMax = ref(null)
const manualOverrides = ref({}) // projectId → finalGrade (only when changed)
const savedGrades = ref([])
const confirmed = ref(false)
const gradingNote = ref('')
const savedNote = ref('')

// Available grades for the current system
const currentGrades = computed(() => GRADE_SYSTEMS[selectedSystem.value].grades)

// Effective grade range (subset of currentGrades based on min/max selection)
const effectiveGrades = computed(() => {
  const grades = currentGrades.value
  const minIdx = gradeMin.value !== null ? grades.indexOf(gradeMin.value) : 0
  const maxIdx = gradeMax.value !== null ? grades.indexOf(gradeMax.value) : grades.length - 1
  if (minIdx < 0 || maxIdx < 0 || minIdx > maxIdx) return grades
  return grades.slice(minIdx, maxIdx + 1)
})

// Reset min/max and manual overrides when system changes
watch(selectedSystem, () => {
  gradeMin.value = null
  gradeMax.value = null
  manualOverrides.value = {}
})

// Reset manual overrides when range changes
watch([gradeMin, gradeMax], () => {
  manualOverrides.value = {}
})

function projectById(id) {
  return projects.value.find(p => p._id === id)
}

// Notenverteilung: „von oben beginnen" (CLAUDE.md). Solange genug Notenstufen
// vorhanden sind, erhält jede Gruppe der Reihe nach eine Note ab der besten;
// überzählige (schlechtere) Noten bleiben unbesetzt. Nur wenn es mehr Gruppen
// als Notenstufen gibt, wird linear komprimiert.
// Muss identisch zu backend/utils/grading.js:gradeFromGroups bleiben.
function computeGrades(groups, gradeRange) {
  const n = groups.length
  const len = gradeRange.length
  const result = []
  for (let i = 0; i < n; i++) {
    const gradeIndex = n <= len ? i : Math.round((i / (n - 1)) * (len - 1))
    const grade = gradeRange[gradeIndex]
    for (const projectId of groups[i].projectIds) {
      result.push({ projectId, computedGrade: grade, finalGrade: grade })
    }
  }
  return result
}

const gradePreview = computed(() => {
  if (!session.value?.groupingResult) return []
  const base = computeGrades(session.value.groupingResult, effectiveGrades.value)
  return base.map(entry => {
    const override = manualOverrides.value[entry.projectId]
    const finalGrade = override !== undefined ? override : entry.finalGrade
    return { ...entry, finalGrade, isManual: override !== undefined }
  })
})

const manualCount = computed(() => Object.keys(manualOverrides.value).length)

const canSave = computed(() => manualCount.value > 0 || confirmed.value)

const allGradesUnchanged = computed(() =>
  savedGrades.value.length > 0 && savedGrades.value.every(g => g.computedGrade === g.finalGrade)
)

function overrideGrade(projectId, value) {
  const computed_ = computeGrades(session.value.groupingResult, effectiveGrades.value).find(e => e.projectId === projectId)
  // Typkonvertierung: Zahlen bleiben Zahlen
  const parsed = isNaN(Number(value)) ? value : Number(value)
  if (parsed === computed_?.computedGrade) {
    delete manualOverrides.value[projectId]
    manualOverrides.value = { ...manualOverrides.value }
  } else {
    manualOverrides.value = { ...manualOverrides.value, [projectId]: parsed }
  }
}

async function load() {
  try {
    const res = await fetch(`/api/sessions/${sessionId}`, { headers: auth.authHeader() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    session.value = data.session
    projects.value = data.projects
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function saveRating() {
  error.value = ''
  saving.value = true
  try {
    const grades = gradePreview.value.map(e => ({
      projectId: e.projectId,
      computedGrade: e.computedGrade,
      finalGrade: e.finalGrade,
    }))
    const payload = {
      gradeSystem: selectedSystem.value,
      distributionMethod: 'linear',
      grades,
    }
    if (gradeMin.value !== null || gradeMax.value !== null) {
      payload.gradeRange = {
        min: gradeMin.value ?? currentGrades.value[0],
        max: gradeMax.value ?? currentGrades.value[currentGrades.value.length - 1],
      }
    }
    if (gradingNote.value.trim()) {
      payload.note = gradingNote.value.trim()
    }
    const res = await fetch(`/api/sessions/${sessionId}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...auth.authHeader() },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    savedGrades.value = grades
    savedNote.value = payload.note || ''
    phase.value = 'done'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
