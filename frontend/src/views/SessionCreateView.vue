<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button @click="step === 1 ? router.push('/dashboard') : (step = 1)" class="text-slate-500 hover:text-slate-800 text-sm">
        ← {{ step === 1 ? 'Abbrechen' : 'Zurück' }}
      </button>
      <h1 class="font-semibold text-slate-800">{{ step === 1 ? 'Neue Session' : 'Abgaben eingeben' }}</h1>
    </header>

    <div class="max-w-lg mx-auto px-4 py-6">

      <!-- Schritt 1: Grundeinstellungen -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Titel *</label>
          <input
            v-model="sessionTitle"
            data-testid="session-title"
            type="text"
            placeholder="z.B. Präsentationen ITA-Klasse"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">Reihungsverfahren *</p>
          <label class="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked disabled class="rounded" />
            Drag & Drop Gruppierung
          </label>
          <p class="text-xs text-slate-400 mt-1">Weitere Verfahren ab Sprint 1b verfügbar.</p>
        </div>

        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">Gruppenanzahl</p>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input v-model.number="groupCount" type="radio" :value="3" /> 3 Gruppen
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input v-model.number="groupCount" type="radio" :value="5" /> 5 Gruppen
            </label>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-slate-700 mb-2">Anonymisierung</p>
          <label class="flex items-center gap-2 text-sm text-slate-700">
            <input v-model="anonymized" type="checkbox" class="rounded" />
            Fantasy-Namen verwenden
          </label>
        </div>

        <button
          @click="step = 2"
          data-testid="step-next"
          :disabled="!sessionTitle.trim()"
          class="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Weiter: Abgaben eingeben →
        </button>
      </div>

      <!-- Schritt 2: Abgaben eingeben -->
      <div v-else class="space-y-4">
        <div
          v-for="(project, i) in projects"
          :key="project.id"
          class="bg-white border border-slate-200 rounded-xl p-4 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-600">Abgabe {{ i + 1 }}</span>
            <button
              v-if="projects.length > 1"
              @click="removeProject(i)"
              data-testid="remove-project"
              class="text-slate-400 hover:text-red-600 text-xs"
            >
              Entfernen
            </button>
          </div>
          <input
            v-model="project.title"
            data-testid="project-title"
            type="text"
            placeholder="Titel *"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            v-model="project.link"
            type="url"
            placeholder="Link (optional)"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          @click="addProject"
          data-testid="add-project"
          class="w-full border-2 border-dashed border-slate-300 text-slate-500 rounded-xl py-3 text-sm hover:border-blue-400 hover:text-blue-600"
        >
          + Abgabe hinzufügen
        </button>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="pt-2 border-t border-slate-200">
          <p class="text-xs text-slate-400 mb-2">mind. 3 Abgaben erforderlich</p>
          <button
            @click="submit"
            data-testid="submit"
            :disabled="!canSubmit || loading"
            class="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Erstellen …' : 'Session erstellen →' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

// Schritt 1
const step = ref(1)
const sessionTitle = ref('')
const groupCount = ref(3)
const anonymized = ref(false)

// Schritt 2
let _id = 0
function makeProject() { return { id: ++_id, title: '', link: '' } }
const projects = ref([makeProject(), makeProject(), makeProject()])

const canSubmit = computed(() =>
  projects.value.filter(p => p.title.trim()).length >= 3
)

const error = ref('')
const loading = ref(false)

function addProject() {
  projects.value.push(makeProject())
}

function removeProject(i) {
  if (projects.value.length > 1) projects.value.splice(i, 1)
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeader() },
      body: JSON.stringify({
        title: sessionTitle.value,
        methods: ['drag-drop'],
        groupCount: groupCount.value,
        anonymized: anonymized.value,
        projects: projects.value
          .filter(p => p.title.trim())
          .map(p => ({ title: p.title, actualName: p.title, link: p.link || undefined })),
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Fehler beim Erstellen')
    router.push(`/sessions/${data.session._id}`)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
