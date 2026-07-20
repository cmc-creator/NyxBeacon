import axios from 'axios'

// Force using Vercel serverless API - /api routes on same domain
// API routes are rewritten by vercel.json to hit /api/index.js serverless function
const API_BASE_URL = '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
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
