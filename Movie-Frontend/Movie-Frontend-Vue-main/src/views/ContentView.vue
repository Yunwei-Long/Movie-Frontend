<script setup>
import { ref, onMounted, watch } from 'vue'
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
    selectedMovie.value = query
    recentSearches.value.unshift(query)
    if (recentSearches.value.length > 5) {
      recentSearches.value = recentSearches.value.slice(0, 5)
    }
    showSuggestions.value = false
    await getAllRecommendations()
  } catch (error) {
    console.error('Failed to get recommendations:', error)
  }
}

let searchDebounceTimer = null

const handleSearchInput = () => {
  const query = searchQuery.value.trim()
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  if (query.length < 2) {
    showSuggestions.value = false
    searchSuggestions.value = []
    return
  }
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
    similarMovies.value = movieStore.similarMovies
  } catch (error) {
    console.error('Failed to get similar movies:', error)
  }
}

const getAllRecommendations = async () => {
  if (!selectedMovie.value.trim()) return
  try {
    await Promise.all([getRecommendations(), getSimilarMovies()])
  } catch (error) {
    console.error('Failed to get recommendations:', error)
  }
}

const handleMovieClick = (movie) => {
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
  const stored = localStorage.getItem('recentMovieSearches')
  if (stored) {
    recentSearches.value = JSON.parse(stored)
  }
})

const saveRecentSearches = () => {
  localStorage.setItem('recentMovieSearches', JSON.stringify(recentSearches.value))
}

watch(recentSearches, saveRecentSearches, { deep: true })
</script>

<template>
  <div class="content-view">
    <div class="container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <!-- 移除了 Content Analysis 徽章 -->
          <h1 class="page-title">Content-Based Recommendations</h1>
          <p class="page-description">
            Discover movies with similar content features including genres, cast, keywords, and production details
          </p>
        </div>
      </section>

      <!-- Recent Searches -->
      <transition name="slide-up">
        <section class="recent-searches-section" v-if="recentSearches.length > 0">
          <div class="recent-searches-container">
            <div class="section-header-mini">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <h3>Recent Searches</h3>
            </div>
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
      </transition>

      <!-- Recommendation Controls -->
      <section class="controls-section">
        <div class="controls-container">
          <div class="search-input-group">
            <label for="movie-search" class="input-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search Movie Title
            </label>
            <div class="search-input-wrapper">
              <input
                id="movie-search"
                v-model="searchQuery"
                @input="handleSearchInput"
                @keyup.enter="handleDirectSearch"
                @focus="handleSearchInput"
                @blur="hideSuggestions"
                class="search-input-field"
                placeholder="Enter a movie title to discover similar films..."
                autocomplete="off"
              />
              <div class="search-loading" v-if="isSearchingSuggestions">
                <div class="loading-spinner-small"></div>
              </div>
            </div>

            <!-- Search Suggestions Dropdown -->
            <transition name="dropdown">
              <div class="search-suggestions" v-if="showSuggestions && searchSuggestions.length > 0">
                <div
                  v-for="movie in searchSuggestions"
                  :key="movie.id || movie.title"
                  class="suggestion-item"
                  @click="selectSuggestion(movie)"
                  @mousedown.prevent
                >
                  <div class="suggestion-poster">
                    <div class="poster-mini" v-if="!movie.poster_path">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                        <line x1="7" y1="2" x2="7" y2="22"/>
                        <line x1="17" y1="2" x2="17" y2="22"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <line x1="2" y1="7" x2="7" y2="7"/>
                        <line x1="2" y1="17" x2="7" y2="17"/>
                        <line x1="17" y1="17" x2="22" y2="17"/>
                        <line x1="17" y1="7" x2="22" y2="7"/>
                      </svg>
                    </div>
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
                      <span v-if="movie.release_date" class="meta-year">{{ getYear(movie.release_date) }}</span>
                      <span v-if="movie.vote_average" class="meta-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {{ movie.vote_average.toFixed(1) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div class="controls-row">
            <div class="control-group">
              <label for="limit-select" class="control-label">Results Limit</label>
              <div class="select-wrapper">
                <select id="limit-select" v-model="currentLimit" class="control-select">
                  <option value="5">5 results</option>
                  <option value="10">10 results</option>
                  <option value="12">12 results</option>
                  <option value="20">20 results</option>
                  <option value="50">50 results</option>
                </select>
                <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div class="control-group">
              <label for="similarity-type" class="control-label">Similarity Type</label>
              <div class="select-wrapper">
                <select id="similarity-type" v-model="selectedType" class="control-select">
                  <option v-for="type in similarityTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
                <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="handleDirectSearch" class="btn primary" :disabled="!searchQuery.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Get Recommendations
            </button>
            <button @click="clearResults" class="btn outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Clear Results
            </button>
          </div>
        </div>
      </section>

      <!-- Selected Movie Info -->
      <transition name="slide-up">
        <section class="selected-movie-section" v-if="selectedMovie">
          <div class="selected-movie-card">
            <div class="selected-header">
              <div class="selected-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Currently Analyzing: <span class="movie-title">{{ selectedMovie }}</span></h3>
            </div>
            <div class="movie-details" v-if="movieStore.movieDetails">
              <div class="detail-item" v-if="movieStore.movieDetails.genres">
                <div class="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Genres</span>
                  <span class="detail-value">
                    {{
                      Array.isArray(movieStore.movieDetails.genres)
                        ? movieStore.movieDetails.genres.map((g) => g.name || g).join(', ')
                        : movieStore.movieDetails.genres
                    }}
                  </span>
                </div>
              </div>
              <div class="detail-item" v-if="movieStore.movieDetails.runtime">
                <div class="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Runtime</span>
                  <span class="detail-value">{{ movieStore.movieDetails.runtime }} min</span>
                </div>
              </div>
              <div class="detail-item" v-if="movieStore.movieDetails.vote_average">
                <div class="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Rating</span>
                  <span class="detail-value">{{ movieStore.movieDetails.vote_average.toFixed(1) }}/10</span>
                </div>
              </div>
              <div class="detail-item" v-if="movieStore.movieDetails.release_date">
                <div class="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Released</span>
                  <span class="detail-value">{{ new Date(movieStore.movieDetails.release_date).getFullYear() }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </transition>

      <!-- Content-Based Recommendations Results -->
      <transition name="fade-up">
        <section class="results-section" v-if="movieStore.hasContentRecommendations">
          <div class="results-header">
            <div class="results-title-wrapper">
              <h2 class="results-title">Content-Based Recommendations</h2>
              <div class="results-badge">{{ movieStore.movieRecommendationsCount }} movies</div>
            </div>
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
      </transition>

      <!-- Similar Movies Results -->
      <transition name="fade-up">
        <section class="results-section" v-if="similarMovies.length > 0">
          <div class="results-header">
            <div class="results-title-wrapper">
              <h2 class="results-title">Similar Movies</h2>
              <div class="results-type">{{ getCurrentSimilarityLabel() }}</div>
            </div>
            <div class="results-badge">{{ similarMovies.length }} movies</div>
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
      </transition>

      <!-- Empty State -->
      <section
        class="empty-state"
        v-if="!movieStore.hasContentRecommendations && !similarMovies.length && !selectedMovie"
      >
        <div class="empty-content">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
          </div>
          <h3>Start Your Discovery</h3>
          <p>
            Enter a movie title above to receive personalized recommendations based on content similarity and feature analysis
          </p>
          <div class="suggestions">
            <p class="suggestions-label">Try these popular titles:</p>
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
          <h2 class="info-title">How Our Recommendations Work</h2>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h4>Content-Based Analysis</h4>
              <p>
                Comprehensive analysis of movie features including genres, keywords, cast, and production to find similar content
              </p>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </div>
              <h4>Similarity-Based Search</h4>
              <p>
                Target specific similarity types like tags, genres, keywords, cast, or production companies for precise discovery
              </p>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h4>Dual Recommendation Engine</h4>
              <p>
                Receive both content-based and similarity-based recommendations simultaneously for comprehensive suggestions
              </p>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
              </div>
              <h4>Smart Curation</h4>
              <p>
                Customize result count and similarity type to fine-tune your movie discovery based on personal preferences
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
  padding: 24px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Header Section - 增强玻璃质感渐变 */
.header-section {
  text-align: center;
  margin-bottom: 48px;
  padding: 56px 32px;
  /* 加深背景色，同时保留玻璃质感 */
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.9) 0%, rgba(225, 240, 235, 0.95) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(184, 213, 198, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(153, 205, 216, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(184, 213, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2C3E3F;
  letter-spacing: -0.5px;
}

.page-description {
  font-size: 1.125rem;
  color: #4A5568;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.7;
}

/* Recent Searches */
.recent-searches-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 24px 28px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.section-header-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #4A5D5E;
}

.section-header-mini svg {
  opacity: 0.7;
}

.section-header-mini h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.recent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.recent-tag {
  background: linear-gradient(135deg, #E8F4F0 0%, #F5EDE4 100%);
  border: 1px solid rgba(184, 213, 198, 0.5);
  color: #4A5D5E;
  padding: 8px 16px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.recent-tag:hover {
  background: linear-gradient(135deg, #B8D5C6 0%, #E8C4A8 100%);
  border-color: #99CDD8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.25);
}

/* Controls Section */
.controls-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  margin-bottom: 48px;
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Search Input */
.search-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2C3E3F;
  font-size: 1.05rem;
}

.input-label svg {
  color: #99CDD8;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input-field {
  width: 100%;
  padding: 18px 24px;
  padding-right: 50px;
  border: 2px solid rgba(184, 213, 198, 0.4);
  border-radius: 12px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  background: white;
  color: #2C3E3F;
}

.search-input-field:focus {
  outline: none;
  border-color: #99CDD8;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
}

.search-input-field::placeholder {
  color: #A0AEC0;
}

.search-loading {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-spinner-small {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(184, 213, 198, 0.3);
  border-top: 2.5px solid #99CDD8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

/* Search Suggestions */
.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  max-height: 380px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(184, 213, 198, 0.15);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: linear-gradient(135deg, rgba(232, 244, 240, 0.6) 0%, rgba(245, 237, 228, 0.6) 100%);
}

.suggestion-poster {
  margin-right: 14px;
  flex-shrink: 0;
}

.poster-mini {
  width: 44px;
  height: 66px;
  border-radius: 8px;
  background: linear-gradient(135deg, #B8D5C6 0%, #E8C4A8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.poster-mini-img {
  width: 44px;
  height: 66px;
  border-radius: 8px;
  object-fit: cover;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #2C3E3F;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.suggestion-meta {
  display: flex;
  gap: 14px;
  font-size: 0.85rem;
}

.meta-year {
  color: #718096;
}

.meta-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #F6AD55;
}

/* Controls Row */
.controls-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-label {
  font-weight: 600;
  color: #2C3E3F;
  font-size: 0.95rem;
}

.select-wrapper {
  position: relative;
}

.control-select {
  width: 100%;
  padding: 14px 40px 14px 18px;
  border: 2px solid rgba(184, 213, 198, 0.4);
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  color: #2C3E3F;
  appearance: none;
}

.control-select:focus {
  border-color: #99CDD8;
  box-shadow: 0 4px 16px rgba(153, 205, 216, 0.15);
}

.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #A0AEC0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  justify-content: center;
}

.btn.primary {
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(153, 205, 216, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(153, 205, 216, 0.4);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn.outline {
  background: transparent;
  color: #4A5D5E;
  border: 2px solid #4A5D5E;
}

.btn.outline:hover {
  background: #4A5D5E;
  color: white;
  transform: translateY(-3px);
}

.btn svg {
  flex-shrink: 0;
}

/* Selected Movie Section */
.selected-movie-section {
  background: linear-gradient(135deg, rgba(232, 244, 240, 0.8) 0%, rgba(245, 237, 228, 0.8) 100%);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: 20px;
  margin-bottom: 48px;
  border-left: 5px solid #99CDD8;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.selected-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.selected-movie-card h3 {
  color: #4A5D5E;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.movie-title {
  color: #2C3E3F;
  font-weight: 700;
}

.movie-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.detail-item {
  background: white;
  padding: 16px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.2) 0%, rgba(184, 213, 198, 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #99CDD8;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #A0AEC0;
}

.detail-value {
  font-size: 0.95rem;
  color: #2C3E3F;
  font-weight: 500;
}

/* Results Section */
.results-section {
  margin-bottom: 56px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(184, 213, 198, 0.3);
}

.results-title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.results-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2C3E3F;
  margin: 0;
}

.results-type {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.2) 0%, rgba(184, 213, 198, 0.2) 100%);
  color: #4A5D5E;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.results-badge {
  padding: 8px 16px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  color: white;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(153, 205, 216, 0.3);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 48px;
  border: 2px dashed rgba(184, 213, 198, 0.4);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.15) 0%, rgba(184, 213, 198, 0.15) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #99CDD8;
}

.empty-state h3 {
  font-size: 1.75rem;
  color: #2C3E3F;
  margin-bottom: 12px;
  font-weight: 700;
}

.empty-state > p {
  color: #718096;
  margin-bottom: 40px;
  font-size: 1.05rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.suggestions {
  max-width: 640px;
  margin: 0 auto;
}

.suggestions-label {
  color: #4A5D5E;
  margin-bottom: 18px;
  font-weight: 600;
  font-size: 1.05rem;
}

.suggestion-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.suggestion-btn {
  background: linear-gradient(135deg, #E8F4F0 0%, #F5EDE4 100%);
  color: #4A5D5E;
  border: 2px solid rgba(184, 213, 198, 0.5);
  padding: 12px 24px;
  border-radius: 28px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-color: #99CDD8;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(153, 205, 216, 0.3);
}

/* Info Section */
.info-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 56px 40px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.info-title {
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E3F;
  margin-bottom: 48px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.info-card {
  background: linear-gradient(135deg, rgba(232, 244, 240, 0.6) 0%, rgba(245, 237, 228, 0.6) 100%);
  padding: 32px;
  border-radius: 16px;
  border-left: 4px solid #99CDD8;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 28px rgba(153, 205, 216, 0.2);
}

.info-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
}

.info-card h4 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2C3E3F;
  margin-bottom: 14px;
}

.info-card p {
  color: #4A5568;
  line-height: 1.7;
  margin: 0;
  font-size: 0.98rem;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-up-enter-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .page-title {
    font-size: 2.25rem;
  }

  .controls-section {
    padding: 28px;
  }

  .controls-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: auto;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .selected-movie-section {
    padding: 24px;
  }

  .movie-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.85rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .controls-section {
    padding: 20px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .suggestion-buttons {
    flex-direction: column;
  }

  .suggestion-btn {
    width: 100%;
  }

  .info-section {
    padding: 36px 24px;
  }

  .info-title {
    font-size: 1.75rem;
  }

  .empty-state {
    padding: 48px 20px;
  }
}
</style>