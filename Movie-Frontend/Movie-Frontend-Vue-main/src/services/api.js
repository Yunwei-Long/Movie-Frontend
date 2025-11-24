import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Common API
export const commonAPI = {
  getInfo: () => api.get('/info'),
  getHealth: () => api.get('/health'),
}

// Content-Based API
export const contentBasedAPI = {
  recommend: (movie, n = 10) => api.get('/content-based/recommend', { params: { movie, n } }),
  search: (query, n = 10) => api.get('/content-based/search', { params: { q: query, n } }),
  getDetails: (movie) => api.get('/content-based/details', { params: { movie } }),
  getRandom: (n = 10) => api.get('/content-based/random', { params: { n } }),
  getSimilar: (movie, type = 'tags', n = 10) =>
    api.get('/content-based/similar', { params: { movie, type, n } }),
}

export default api
