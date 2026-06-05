import axios from 'axios'
import { API_BASE, STORAGE_KEYS } from '../config/constants.js'

axios.defaults.baseURL = API_BASE
axios.defaults.timeout = 10000
axios.defaults.headers['Content-Type'] = 'application/json'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export default axios
