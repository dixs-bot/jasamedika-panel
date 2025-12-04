import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// Global fetch wrapper: attach Authorization header from localStorage automatically
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input, init = {}) => {
    try {
      const token = localStorage.getItem('token')
      init = init || {}
      // normalize headers object
      let headers = {}
      if (init.headers instanceof Headers) {
        init.headers.forEach((v,k)=>{ headers[k]=v })
      } else if (init.headers) {
        headers = { ...init.headers }
      }
      if (token && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${token}`
      }
      init.headers = headers
    } catch (e) {
      // ignore localStorage errors
    }
    return originalFetch(input, init)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
