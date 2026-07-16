import axios from 'axios'

// Determine API base URL
const getAPIBaseURL = () => {
  // On Vercel, use relative paths to same domain
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel') || window.location.hostname.includes('nyxbeacon'))) {
    return '/api'
  }
  // Use environment variable if set, otherwise localhost for development
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
}

export const api = axios.create({
  baseURL: getAPIBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
