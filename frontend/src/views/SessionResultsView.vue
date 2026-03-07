<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button @click="router.push(`/sessions/${sessionId}`)" class="text-slate-500 hover:text-slate-800 text-sm">
        ← Session verwalten
      </button>
      <h1 class="font-semibold text-slate-800">
        {{ phase === 'ranking' ? 'Reihungsergebnis' : phase === 'grading' ? 'Benotung' : 'Benotung abgeschlossen ✓' }}
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
      >Benotung</button>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64 text-slate-400">Lädt …</div>

    <div v-else class="max-w-2xl mx-auto px-4 py-6 space-y-4">

      <!-- ── Schritt 1: Reihungsergebnis ── -->
      <template v-if="phase === 'ranking'">
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
              <span
                v-if="session.anonymized && revealedNames[pid]"
                class="block text-xs text-slate-500"
              >{{ projectById(pid)?.actualName }}</span>
              <button
                v-if="session.anonymized"
                @click="revealedNames[pid] = !revealedNames[pid]"
                class="ml-1 text-slate-400 hover:text-slate-600 text-xs"
              >👁</button>
            </div>
            <span v-if="group.projectIds.length === 0" class="text-sm text-slate-400 italic">leer</span>
          </div>
        </div>

        <button
          data-testid="to-grading"
          @click="phase = 'grading'"
          class="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
        >
          Jetzt benoten →
        </button>
      </template>

      <!-- ── Schritt 2: Benotung ── -->
      <template v-else-if="phase === 'grading'">
        <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Notensystem</label>
            <select
              v-model="selectedSystem"
              data-testid="grade-system-select"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option v-for="(sys, key) in GRADE_SYSTEMS" :key="key" :value="key">{{ sys.label }}</option>
            </select>
          </div>
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
                  Note {{ entry.finalGrade }}
                </span>
                <span class="text-slate-700">{{ projectById(entry.projectId)?.displayName }}</span>
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

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          data-testid="save-rating"
          :disabled="saving"
          @click="saveRating"
          class="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40"
        >
          {{ saving ? 'Speichern …' : 'Benotung speichern' }}
        </button>
      </template>

      <!-- ── Abschlussansicht ── -->
      <template v-else-if="phase === 'done'">
        <div class="bg-white border border-slate-200 rounded-xl p-4">
          <p class="text-sm text-slate-500 mb-1">
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
                <td class="py-2">{{ projectById(entry.projectId)?.displayName }}</td>
                <td class="py-2 font-mono">{{ entry.finalGrade }}</td>
                <td class="py-2 text-amber-500">{{ entry.finalGrade !== entry.computedGrade ? '✎' : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

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

const selectedSystem = ref('schulnoten')
const manualOverrides = ref({}) // projectId → finalGrade (only when changed)
const savedGrades = ref([])

function projectById(id) {
  return projects.value.find(p => p._id === id)
}

// Lineare Notenverteilung (analog zu backend/utils/grading.js gradeFromGroups)
function computeGrades(groups, gradeSystem) {
  const result = []
  for (let i = 0; i < groups.length; i++) {
    const grade = gradeSystem[i]
    for (const projectId of groups[i].projectIds) {
      result.push({ projectId, computedGrade: grade, finalGrade: grade })
    }
  }
  return result
}

const gradePreview = computed(() => {
  if (!session.value?.groupingResult) return []
  const sys = GRADE_SYSTEMS[selectedSystem.value].grades
  const base = computeGrades(session.value.groupingResult, sys)
  return base.map(entry => {
    const override = manualOverrides.value[entry.projectId]
    const finalGrade = override !== undefined ? override : entry.finalGrade
    return { ...entry, finalGrade, isManual: override !== undefined }
  })
})

const manualCount = computed(() => Object.keys(manualOverrides.value).length)

function overrideGrade(projectId, value) {
  const sys = GRADE_SYSTEMS[selectedSystem.value].grades
  const computed_ = computeGrades(session.value.groupingResult, sys).find(e => e.projectId === projectId)
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
    const res = await fetch(`/api/sessions/${sessionId}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...auth.authHeader() },
      body: JSON.stringify({ gradeSystem: selectedSystem.value, distributionMethod: 'linear', grades }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    savedGrades.value = grades
    phase.value = 'done'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
