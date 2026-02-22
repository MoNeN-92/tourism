import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  // Backward compatibility: support legacy localStorage token for one migration window.
  if (typeof window !== 'undefined' && !config.headers.Authorization) {
    const legacyToken = localStorage.getItem('token')
    if (legacyToken) {
      config.headers.Authorization = `Bearer ${legacyToken}`
    }
  }
  return config
})

export default api
