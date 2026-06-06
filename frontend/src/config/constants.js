/** Uygulama geneli sabitler */

/** Lokal: /api (Vite proxy). Production: VITE_API_URL (Render backend). */
const viteApi = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || ''
export const API_BASE = viteApi || '/api'

export const STORAGE_KEYS = {
  token: 'foresto_token',
  user: 'foresto_user',
}

export const AUTH_ROUTES = {
  login: '/login',
  home: '/',
}

export const PAGINATION = {
  productsPageSize: 50,
  movementsLimit: 30000,
}

export const FORECAST_PERIODS = [30, 60, 90]
