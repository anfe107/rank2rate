<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <span class="text-lg font-bold text-slate-800">rank2rate</span>
      <button
        @click="logout"
        class="text-sm text-slate-500 hover:text-slate-800"
      >
        Abmelden
      </button>
    </header>

    <!-- Content -->
    <main class="max-w-lg mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-slate-800">Meine Sessions</h1>
        <router-link
          to="/sessions/new"
          class="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          + Neu
        </router-link>
      </div>

      <!-- Laden -->
      <div v-if="loading" class="text-sm text-slate-500">Laden …</div>

      <!-- Fehler -->
      <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

      <!-- Leerzustand -->
      <div v-else-if="sessions.length === 0" class="text-center py-16">
        <p class="text-slate-500 mb-4">Noch keine Sessions.</p>
        <router-link
          to="/sessions/new"
          class="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Erste Session erstellen
        </router-link>
      </div>

      <!-- Session-Liste -->
      <ul v-else class="space-y-3">
        <li
          v-for="s in sessions"
          :key="s._id"
          class="bg-white border border-slate-200 rounded-xl p-4"
        >
          <p class="font-semibold text-slate-800">{{ s.title }}</p>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ formatMethods(s.methods) }} · {{ s.projectCount }} Abgaben
          </p>
          <p class="text-sm text-slate-400 mt-0.5">{{ formatDate(s.createdAt) }}</p>
          <p class="text-sm mt-1" :class="statusClass(s.status)">
            Status: {{ statusLabel(s.status) }}
          </p>
          <div class="flex gap-2 mt-3">
            <router-link
              :to="`/sessions/${s._id}`"
              class="text-sm font-medium text-blue-600 hover:underline"
            >
              Verwalten
            </router-link>
            <router-link
              v-if="s.status === 'ranked' || s.status === 'graded'"
              :to="`/sessions/${s._id}/results`"
              class="text-sm font-medium text-green-600 hover:underline"
            >
              Ergebnisse
            </router-link>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const sessions = ref([])
const loading = ref(true)
const error = ref('')

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/sessions`, {
      headers: auth.authHeader(),
    })
    if (!res.ok) throw new Error('Sessions konnten nicht geladen werden')
    sessions.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function logout() {
  auth.logout()
  router.push('/login')
}

const METHOD_LABELS = {
  'drag-drop': 'Drag & Drop',
  'pairwise': 'Paarvergleich',
  'dot-voting': 'Dot Voting',
}

function formatMethods(methods) {
  return methods.map(m => METHOD_LABELS[m] ?? m).join(' + ')
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_LABELS = {
  draft: 'Entwurf',
  active: 'Abstimmung läuft',
  ranked: 'Reihung abgeschlossen',
  graded: 'Benotet',
}

function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

function statusClass(status) {
  if (status === 'graded') return 'text-green-600 font-medium'
  if (status === 'ranked') return 'text-blue-600'
  if (status === 'active') return 'text-amber-500'
  return 'text-slate-500'
}
</script>
