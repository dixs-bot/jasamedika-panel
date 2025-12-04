import axios from 'axios'

// Use the current page hostname so frontend works from PC or device
const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost'
const API_BASE_URL = `http://${host}:8080`

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {}
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      try { localStorage.removeItem('token') } catch(e){}
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
