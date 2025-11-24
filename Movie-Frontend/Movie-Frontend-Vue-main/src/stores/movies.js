import { defineStore } from 'pinia'
import { contentBasedAPI, commonAPI } from '@/services/api'

export const useMovieStore = defineStore('movies', {
  state: () => ({
    // Common state
    systemInfo: null,
    isLoading: false,
    error: null,

    // Search state
    searchResults: [],
    searchQuery: '',

    // Content-based state
    contentRecommendations: [],
    movieDetails: null,
    similarMovies: [],
    randomMovies: [],

    // UI state
    currentView: 'home',
    selectedMovie: null,
  }),

  getters: {
    hasSearchResults: (state) => state.searchResults.length > 0,
    hasContentRecommendations: (state) => state.contentRecommendations.length > 0,
    movieRecommendationsCount: (state) => state.contentRecommendations.length,
  },

  actions: {
    setLoading(loading) {
      this.isLoading = loading
    },

    setError(error) {
      this.error = error
      this.setLoading(false)
    },

    clearError() {
      this.error = null
    },

    // Common actions
    async fetchSystemInfo() {
      try {
        this.setLoading(true)
        this.clearError()
        const response = await commonAPI.getInfo()
        this.systemInfo = response.data
        return response.data
      } catch (error) {
        this.setError('Failed to fetch system information: ' + error.message)
        throw error
      }
    },

    async checkHealth() {
      try {
        const response = await commonAPI.getHealth()
        return response.data
      } catch (error) {
        this.setError('Health check failed: ' + error.message)
        throw error
      }
    },

    // Content-based actions
    async searchMovies(query, limit = 10) {
      try {
        this.setLoading(true)
        this.clearError()
        this.searchQuery = query
        const response = await contentBasedAPI.search(query, limit)
        this.searchResults = response.data.results || []
        return this.searchResults
      } catch (error) {
        this.setError('Failed to search movies: ' + error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async getContentRecommendations(movie, limit = 10) {
      try {
        this.setLoading(true)
        this.clearError()
        this.selectedMovie = movie
        const response = await contentBasedAPI.recommend(movie, limit)
        const recommendations = response.data.recommendations || []

        // Enhance each recommendation with movie details
        this.contentRecommendations = await Promise.all(
          recommendations.map(async (rec) => {
            try {
              // Get full movie details using movie_id if not already included
              let details = rec
              if (!rec.overview) {
                const detailsResponse = await contentBasedAPI.getDetails(rec.title)
                details = detailsResponse.data.details
              }

              // Merge recommendation data with movie details
              return {
                ...rec,
                // Use details for display, keep recommendation data for scoring
                poster_path: details.poster_path || rec.poster_path || null,
                overview: details.overview || rec.overview || 'No description available.',
                vote_average: details.vote_average || rec.avg_score || rec.vote_average || 0,
                vote_count: details.vote_count || 0,
                popularity: details.popularity || 0,
                release_date: details.release_date || null,
                genres: details.genres
                  ? Array.isArray(details.genres)
                    ? details.genres
                    : details.genres && typeof details.genres === 'string'
                      ? details.genres.split(',').map((g) => g.trim())
                      : []
                  : [],
                runtime: details.runtime || rec.runtime || null,
                budget: details.budget || rec.budget || null,
                revenue: details.revenue || rec.revenue || null,
                production_company: details.production_company || rec.production_company || null,
              }
            } catch (error) {
              console.warn(`Failed to get details for movie ${rec.title}:`, error)
              return {
                ...rec,
                poster_path: rec.poster_path || null,
                overview: rec.overview || 'Description not available.',
                vote_average: rec.avg_score || rec.vote_average || 0,
                vote_count: 0,
                popularity: 0,
                release_date: null,
                genres: [],
                runtime: null,
                budget: null,
                revenue: null,
                production_company: null,
              }
            }
          }),
        )

        return this.contentRecommendations
      } catch (error) {
        this.setError('Failed to get content recommendations: ' + error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async getMovieDetails(movie) {
      try {
        this.setLoading(true)
        this.clearError()
        const response = await contentBasedAPI.getDetails(movie)
        // Extract movie data from the nested details field
        this.movieDetails = response.data.details
        return this.movieDetails
      } catch (error) {
        this.setError('Failed to get movie details: ' + error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async getSimilarMovies(movie, type = 'tags', limit = 10) {
      try {
        this.setLoading(true)
        this.clearError()
        const response = await contentBasedAPI.getSimilar(movie, type, limit)
        const similarMovies = response.data.similar_movies || []

        // Enhance each similar movie with movie details
        this.similarMovies = await Promise.all(
          similarMovies.map(async (movie) => {
            try {
              // Get full movie details
              const detailsResponse = await contentBasedAPI.getDetails(movie.title)
              const details = detailsResponse.data.details

              // Merge similar movie data with movie details
              return {
                ...movie,
                // Use details for display
                poster_path: details.poster_path || movie.poster_path || null,
                overview: details.overview || movie.overview || 'No description available.',
                vote_average: details.vote_average || movie.vote_average || 0,
                vote_count: details.vote_count || 0,
                popularity: details.popularity || 0,
                release_date: details.release_date || null,
                genres: details.genres
                  ? Array.isArray(details.genres)
                    ? details.genres
                    : details.genres && typeof details.genres === 'string'
                      ? details.genres.split(',').map((g) => g.trim())
                      : []
                  : [],
                runtime: details.runtime || movie.runtime || null,
                budget: details.budget || movie.budget || null,
                revenue: details.revenue || movie.revenue || null,
                production_company: details.production_company || movie.production_company || null,
              }
            } catch (error) {
              console.warn(`Failed to get details for similar movie ${movie.title}:`, error)
              return {
                ...movie,
                poster_path: movie.poster_path || null,
                overview: movie.overview || 'Description not available.',
                vote_average: movie.vote_average || 0,
                vote_count: 0,
                popularity: 0,
                release_date: null,
                genres: [],
                runtime: null,
                budget: null,
                revenue: null,
                production_company: null,
              }
            }
          }),
        )

        return this.similarMovies
      } catch (error) {
        this.setError('Failed to get similar movies: ' + error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async getRandomMovies(limit = 10) {
      try {
        this.setLoading(true)
        this.clearError()
        const response = await contentBasedAPI.getRandom(limit)
        const randomMovies = response.data.random_movies || []

        // Enhance each random movie with movie details
        this.randomMovies = await Promise.all(
          randomMovies.map(async (movie) => {
            try {
              // Get full movie details
              const detailsResponse = await contentBasedAPI.getDetails(movie.title)
              const details = detailsResponse.data.details

              // Merge random movie data with movie details
              return {
                ...movie,
                // Use details for display
                poster_path: details.poster_path || movie.poster_path || null,
                overview: details.overview || movie.overview || 'No description available.',
                vote_average: details.vote_average || movie.vote_average || 0,
                vote_count: details.vote_count || 0,
                popularity: details.popularity || 0,
                release_date: details.release_date || null,
                genres: details.genres
                  ? Array.isArray(details.genres)
                    ? details.genres
                    : details.genres && typeof details.genres === 'string'
                      ? details.genres.split(',').map((g) => g.trim())
                      : []
                  : [],
                runtime: details.runtime || movie.runtime || null,
                budget: details.budget || movie.budget || null,
                revenue: details.revenue || movie.revenue || null,
                production_company: details.production_company || movie.production_company || null,
              }
            } catch (error) {
              console.warn(`Failed to get details for random movie ${movie.title}:`, error)
              return {
                ...movie,
                poster_path: movie.poster_path || null,
                overview: movie.overview || 'Description not available.',
                vote_average: movie.vote_average || 0,
                vote_count: 0,
                popularity: 0,
                release_date: null,
                genres: [],
                runtime: null,
                budget: null,
                revenue: null,
                production_company: null,
              }
            }
          }),
        )

        return this.randomMovies
      } catch (error) {
        this.setError('Failed to get random movies: ' + error.message)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Utility actions
    setCurrentView(view) {
      this.currentView = view
    },

    clearMovieData() {
      this.contentRecommendations = []
      this.movieDetails = null
      this.similarMovies = []
      this.selectedMovie = null
    },

    resetState() {
      this.searchResults = []
      this.searchQuery = ''
      this.contentRecommendations = []
      this.movieDetails = null
      this.similarMovies = []
      this.randomMovies = []
      this.selectedMovie = null
      this.error = null
    },
  },
})
