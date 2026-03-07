import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Login fehlgeschlagen')
    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  async function register(email, password) {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Registrierung fehlgeschlagen')
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  function authHeader() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, isAuthenticated, login, register, logout, authHeader }
})
