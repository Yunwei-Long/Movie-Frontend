<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MovieCard from '@/components/MovieCard.vue'
import { useMovieStore } from '@/stores/movies'

const router = useRouter()
const movieStore = useMovieStore()

const searchQuery = ref('')
const selectedMovie = ref('')
const selectedType = ref('tags')
const currentLimit = ref(12)
const similarMovies = ref([])
const recentSearches = ref([])

// Autocomplete states
const searchSuggestions = ref([])
const showSuggestions = ref(false)
const isSearchingSuggestions = ref(false)

const similarityTypes = [
  { value: 'tags', label: 'Tags & Keywords (Default)' },
  { value: 'genres', label: 'Genres' },
  { value: 'keywords', label: 'Keywords Only' },
  { value: 'cast', label: 'Cast & Crew' },
  { value: 'production', label: 'Production Companies' },
]

const handleDirectSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  try {
    // Set the selected movie and get recommendations directly
    selectedMovie.value = query

    // Add to recent searches
    recentSearches.value.unshift(query)
    if (recentSearches.value.length > 5) {
      recentSearches.value = recentSearches.value.slice(0, 5)
    }

    // Hide suggestions when searching
    showSuggestions.value = false

    // Get both types of recommendations
    await getAllRecommendations()
  } catch (error) {
    console.error('Failed to get recommendations:', error)
  }
}

// Search suggestions functionality
let searchDebounceTimer = null

const handleSearchInput = () => {
  const query = searchQuery.value.trim()

  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // Hide suggestions if query is too short
  if (query.length < 2) {
    showSuggestions.value = false
    searchSuggestions.value = []
    return
  }

  // Debounce search suggestions
  searchDebounceTimer = setTimeout(() => {
    fetchSearchSuggestions(query)
  }, 300)
}

const fetchSearchSuggestions = async (query) => {
  try {
    isSearchingSuggestions.value = true
    const results = await movieStore.searchMovies(query, 5)
    searchSuggestions.value = results.slice(0, 5)
    showSuggestions.value = true
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    searchSuggestions.value = []
  } finally {
    isSearchingSuggestions.value = false
  }
}

const selectSuggestion = (movie) => {
  searchQuery.value = movie.title
  showSuggestions.value = false
  handleDirectSearch()
}

const hideSuggestions = () => {
  // Delay hiding to allow click events
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectRecentSearch = (search) => {
  searchQuery.value = search
  handleDirectSearch()
}

const selectSuggestionMovie = (movie) => {
  searchQuery.value = movie
  handleDirectSearch()
}

const getRecommendations = async () => {
  if (!selectedMovie.value.trim()) return

  try {
    await movieStore.getContentRecommendations(selectedMovie.value, parseInt(currentLimit.value))
  } catch (error) {
    console.error('Failed to get recommendations:', error)
  }
}

const getSimilarMovies = async () => {
  if (!selectedMovie.value.trim()) return

  try {
    await movieStore.getSimilarMovies(
      selectedMovie.value,
      selectedType.value,
      parseInt(currentLimit.value),
    )
    // Use the enhanced similar movies from the store directly
    similarMovies.value = movieStore.similarMovies
  } catch (error) {
    console.error('Failed to get similar movies:', error)
  }
}

const getAllRecommendations = async () => {
  if (!selectedMovie.value.trim()) return

  try {
    // Get both content recommendations and similar movies in parallel
    await Promise.all([getRecommendations(), getSimilarMovies()])
  } catch (error) {
    console.error('Failed to get recommendations:', error)
  }
}

const handleMovieClick = (movie) => {
  console.log('ContentView handleMovieClick - movie:', movie)
  console.log('ContentView handleMovieClick - movie.title:', movie?.title)
  console.log('ContentView handleMovieClick - movie.id:', movie?.id)
  console.log('ContentView handleMovieClick - movie keys:', Object.keys(movie || {}))

  if (!movie?.title) {
    console.error('Movie title is undefined! Movie object:', movie)
    return
  }

  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleMovieDetails = async (movie) => {
  await movieStore.getMovieDetails(movie.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const getCurrentSimilarityLabel = () => {
  const currentType = similarityTypes.find((type) => type.value === selectedType.value)
  return currentType ? currentType.label : selectedType.value
}

const getYear = (dateString) => {
  return new Date(dateString).getFullYear()
}

const clearResults = () => {
  movieStore.clearMovieData()
  similarMovies.value = []
  selectedMovie.value = ''
  searchQuery.value = ''
}

onMounted(() => {
  // Load any recent searches from localStorage
  const stored = localStorage.getItem('recentMovieSearches')
  if (stored) {
    recentSearches.value = JSON.parse(stored)
  }
})

// Save recent searches to localStorage
const saveRecentSearches = () => {
  localStorage.setItem('recentMovieSearches', JSON.stringify(recentSearches.value))
}

// Watch for changes in recent searches
import { watch } from 'vue'
watch(recentSearches, saveRecentSearches, { deep: true })
</script>

<template>
  <div class="content-view">
    <div class="container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <h1 class="page-title">🎭 Content-Based Recommendations</h1>
          <p class="page-description">
            Discover movies similar to ones you love based on content features like genres, actors,
            keywords, and more
          </p>
        </div>
      </section>

      <!-- Recent Searches -->
      <section class="recent-searches-section" v-if="recentSearches.length > 0">
        <div class="recent-searches-container">
          <h3>Recent Searches:</h3>
          <div class="recent-tags">
            <button
              v-for="search in recentSearches"
              :key="search"
              @click="selectRecentSearch(search)"
              class="recent-tag"
            >
              {{ search }}
            </button>
          </div>
        </div>
      </section>

      <!-- Recommendation Controls -->
      <section class="controls-section">
        <div class="controls-container">
          <div class="search-input-group">
            <label for="movie-search">Movie Title:</label>
            <div class="search-input-wrapper">
              <input
                id="movie-search"
                v-model="searchQuery"
                @input="handleSearchInput"
                @keyup.enter="handleDirectSearch"
                @focus="handleSearchInput"
                @blur="hideSuggestions"
                class="search-input-field"
                placeholder="Enter movie title..."
                autocomplete="off"
              />
              <div class="search-loading" v-if="isSearchingSuggestions">
                <div class="loading-spinner-small"></div>
              </div>
            </div>

            <!-- Search Suggestions Dropdown -->
            <div class="search-suggestions" v-if="showSuggestions && searchSuggestions.length > 0">
              <div
                v-for="movie in searchSuggestions"
                :key="movie.id || movie.title"
                class="suggestion-item"
                @click="selectSuggestion(movie)"
                @mousedown.prevent
              >
                <div class="suggestion-poster">
                  <div class="poster-mini" v-if="!movie.poster_path">🎬</div>
                  <img
                    v-else
                    :src="`https://image.tmdb.org/t/p/w92${movie.poster_path}`"
                    :alt="movie.title"
                    class="poster-mini-img"
                  />
                </div>
                <div class="suggestion-info">
                  <div class="suggestion-title">{{ movie.title }}</div>
                  <div class="suggestion-meta">
                    <span v-if="movie.release_date">{{ getYear(movie.release_date) }}</span>
                    <span v-if="movie.vote_average">⭐ {{ movie.vote_average.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="controls-row">
            <div class="control-group">
              <label for="limit-select">Limit Results:</label>
              <select id="limit-select" v-model="currentLimit" class="control-select">
                <option value="5">5 results</option>
                <option value="10">10 results</option>
                <option value="12">12 results</option>
                <option value="20">20 results</option>
                <option value="50">50 results</option>
              </select>
            </div>

            <div class="control-group">
              <label for="similarity-type">Similarity Type:</label>
              <select id="similarity-type" v-model="selectedType" class="control-select">
                <option v-for="type in similarityTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="handleDirectSearch" class="btn primary" :disabled="!searchQuery.trim()">
              Get Recommendations
            </button>
            <button @click="clearResults" class="btn outline">Clear Results</button>
          </div>
        </div>
      </section>

      <!-- Selected Movie Info -->
      <section class="selected-movie-section" v-if="selectedMovie">
        <div class="selected-movie-card">
          <h3>📽️ Currently Analyzing: {{ selectedMovie }}</h3>
          <div class="movie-details" v-if="movieStore.movieDetails">
            <div class="detail-item" v-if="movieStore.movieDetails.genres">
              <strong>Genres:</strong>
              {{
                Array.isArray(movieStore.movieDetails.genres)
                  ? movieStore.movieDetails.genres.map((g) => g.name || g).join(', ')
                  : movieStore.movieDetails.genres
              }}
            </div>
            <div class="detail-item" v-if="movieStore.movieDetails.runtime">
              <strong>Runtime:</strong> {{ movieStore.movieDetails.runtime }} minutes
            </div>
            <div class="detail-item" v-if="movieStore.movieDetails.vote_average">
              <strong>Rating:</strong> ⭐ {{ movieStore.movieDetails.vote_average.toFixed(1) }}
            </div>
            <div class="detail-item" v-if="movieStore.movieDetails.release_date">
              <strong>Release Year:</strong>
              {{ new Date(movieStore.movieDetails.release_date).getFullYear() }}
            </div>
          </div>
        </div>
      </section>

      <!-- Content-Based Recommendations Results -->
      <section class="results-section" v-if="movieStore.hasContentRecommendations">
        <div class="results-header">
          <h2 class="results-title">🎯 Content-Based Recommendations</h2>
          <p class="results-count">{{ movieStore.movieRecommendationsCount }} movies found</p>
        </div>
        <div class="movies-grid">
          <MovieCard
            v-for="movie in movieStore.contentRecommendations"
            :key="movie.id || movie.title"
            :movie="movie"
            @click="handleMovieClick"
            @show-details="handleMovieDetails"
          />
        </div>
      </section>

      <!-- Similar Movies Results -->
      <section class="results-section" v-if="similarMovies.length > 0">
        <div class="results-header">
          <h2 class="results-title">🔗 Similar Movies ({{ getCurrentSimilarityLabel() }})</h2>
          <p class="results-count">{{ similarMovies.length }} movies found</p>
        </div>
        <div class="movies-grid">
          <MovieCard
            v-for="movie in similarMovies"
            :key="movie.id || movie.title"
            :movie="movie"
            @click="handleMovieClick"
            @show-details="handleMovieDetails"
          />
        </div>
      </section>

      <!-- Empty State -->
      <section
        class="empty-state"
        v-if="!movieStore.hasContentRecommendations && !similarMovies.length && !selectedMovie"
      >
        <div class="empty-content">
          <div class="empty-icon">🎬</div>
          <h3>No Recommendations Yet</h3>
          <p>
            Enter a movie title above and click "Get Recommendations" to see both content-based and
            similarity-based results.
          </p>
          <div class="suggestions">
            <p>Try searching for popular movies like:</p>
            <div class="suggestion-buttons">
              <button @click="selectSuggestionMovie('The Dark Knight')" class="suggestion-btn">
                The Dark Knight
              </button>
              <button @click="selectSuggestionMovie('Inception')" class="suggestion-btn">
                Inception
              </button>
              <button @click="selectSuggestionMovie('The Matrix')" class="suggestion-btn">
                The Matrix
              </button>
              <button @click="selectSuggestionMovie('Pulp Fiction')" class="suggestion-btn">
                Pulp Fiction
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="info-section">
        <div class="info-content">
          <h2>🔍 How Our Recommendations Work</h2>
          <div class="info-grid">
            <div class="info-card">
              <h4>🎯 Content-Based Analysis</h4>
              <p>
                We analyze comprehensive movie features including genres, keywords, cast, production
                companies, and more to find movies with similar content.
              </p>
            </div>
            <div class="info-card">
              <h4>🔗 Similarity-Based Search</h4>
              <p>
                Find movies based on specific similarity types - tags, genres, keywords, cast, or
                production companies - for more targeted discovery.
              </p>
            </div>
            <div class="info-card">
              <h4>⚡ Dual Recommendation Engine</h4>
              <p>
                Get both content-based recommendations and similarity-based results in a single
                click, giving you comprehensive movie suggestions.
              </p>
            </div>
            <div class="info-card">
              <h4>🎬 Smart Curation</h4>
              <p>
                Control the number of results and similarity type to fine-tune your movie discovery
                experience based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.content-view {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.recent-searches-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.recent-searches-container h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 15px;
  font-weight: 600;
}

.recent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.recent-searches {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.recent-searches h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
}

.recent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-tag {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.recent-tag:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.controls-section {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.controls-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.control-group label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.control-select {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

.control-select:focus {
  border-color: #667eea;
}

.search-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.search-input-group label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input-field {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease;
  background: white;
}

.search-input-field:focus {
  outline: none;
  border-color: #667eea;
}

.search-loading {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid #e9ecef;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-poster {
  margin-right: 12px;
  flex-shrink: 0;
}

.poster-mini,
.poster-mini-img {
  width: 40px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 0.85rem;
}

@keyframes spin {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.movie-input {
  flex: 1;
  min-width: 300px;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: border-color 0.3s ease;
}

.movie-input:focus {
  outline: none;
  border-color: #667eea;
}

.similarity-select {
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1.1rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 250px;
}

.similarity-select:focus {
  border-color: #667eea;
}

.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
}

.btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #5a6268;
}

.btn.outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn.outline:hover {
  background: #6c757d;
  color: white;
}

.button-wrapper {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.selected-movie-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
}

.selected-movie-card h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.movie-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-item strong {
  color: #667eea;
  font-weight: 600;
}

.results-section {
  margin-bottom: 40px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.results-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.results-count {
  color: #666;
  font-size: 1rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.suggestions {
  max-width: 600px;
  margin: 0 auto;
}

.suggestions p {
  color: #666;
  margin-bottom: 15px;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.suggestion-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.info-section {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-content h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.info-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.info-card h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .content-view {
    padding: 15px;
  }

  .container {
    padding: 0 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .search-section,
  .controls-section,
  .selected-movie-section,
  .info-section {
    padding: 25px;
  }

  .controls-row {
    flex-direction: column;
    gap: 15px;
  }

  .control-group {
    min-width: auto;
  }

  .search-input-group {
    gap: 8px;
  }

  .search-input-group label {
    font-size: 1rem;
  }

  .search-input-field,
  .control-select {
    width: 100%;
    padding: 14px 18px;
    font-size: 1rem;
  }

  .search-suggestions {
    max-height: 250px;
  }

  .suggestion-item {
    padding: 10px 12px;
  }

  .poster-mini,
  .poster-mini-img {
    width: 32px;
    height: 48px;
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .action-buttons .btn {
    min-width: auto;
    padding: 14px 20px;
    font-size: 1rem;
    min-height: 48px;
  }

  .controls-container {
    gap: 15px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 25px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .suggestion-buttons {
    flex-direction: column;
    align-items: center;
  }

  .suggestion-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
