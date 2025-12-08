<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MovieCard from '@/components/MovieCard.vue'
import { useMovieStore } from '@/stores/movies'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()

const movie = ref(null)
const similarMovies = ref([])
const selectedSimilarityType = ref('tags')
const currentLimit = ref(12)
const isLoading = ref(false)

const similarityTypes = [
  { value: 'tags', label: 'Tags & Keywords (Default)' },
  { value: 'genres', label: 'Genres' },
  { value: 'keywords', label: 'Keywords Only' },
  { value: 'cast', label: 'Cast & Crew' },
  { value: 'production', label: 'Production Companies' },
]

const movieTitle = computed(() => {
  return decodeURIComponent(route.params.title)
})

const getMovieDetails = async () => {
  try {
    isLoading.value = true
    await movieStore.getMovieDetails(movieTitle.value)
    movie.value = movieStore.movieDetails
  } catch (error) {
    console.error('Failed to get movie details:', error)
  } finally {
    isLoading.value = false
  }
}

const getSimilarMovies = async () => {
  try {
    const results = await movieStore.getSimilarMovies(
      movieTitle.value,
      selectedSimilarityType.value,
      parseInt(currentLimit.value),
    )
    similarMovies.value = results
  } catch (error) {
    console.error('Failed to get similar movies:', error)
  }
}

const getAllRecommendations = async () => {
  try {
    await getSimilarMovies()
  } catch (error) {
    console.error('Failed to get similar movies:', error)
  }
}

const handleMovieClick = (clickedMovie) => {
  router.push(`/movie/${encodeURIComponent(clickedMovie.title)}`)
}

const handleMovieDetails = async (movie) => {
  await movieStore.getMovieDetails(movie.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const formatRuntime = (minutes) => {
  if (!minutes) return 'Unknown'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const formatCurrency = (amount) => {
  if (!amount) return 'Unknown'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getReleaseYear = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).getFullYear()
}

const getCurrentSimilarityLabel = () => {
  const currentType = similarityTypes.find((type) => type.value === selectedSimilarityType.value)
  return currentType ? currentType.label : selectedSimilarityType.value
}

onMounted(async () => {
  await Promise.all([getMovieDetails(), getAllRecommendations()])
})
</script>

<template>
  <div class="movie-details-view">
    <div class="container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <h1 class="page-title">Movie Details</h1>
          <p class="page-description">
            Explore detailed information about {{ movieTitle }} and discover similar movies based on
            content features
          </p>
          <div class="header-actions">
            <button @click="router.back()" class="action-btn back">
              <span class="btn-icon">←</span>
              Back to Previous
            </button>
            <button @click="router.push('/')" class="action-btn home">
              <span class="btn-icon">↩</span>
              Back to Home
            </button>
          </div>
        </div>
      </section>

      <!-- Movie Details Section -->
      <section class="movie-details-section" v-if="movie">
        <div class="movie-details-container">
          <!-- Movie Header -->
          <div class="movie-header">
            <div class="poster-section">
              <div class="poster-placeholder" v-if="!movie.poster_path">
                <div class="poster-icon">Film</div>
              </div>
              <img
                v-else
                :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
                :alt="movie.title"
                class="movie-poster"
              />
            </div>

            <div class="movie-info-section">
              <h1 class="movie-title">{{ movie.title }}</h1>

              <div class="movie-meta">
                <div class="meta-item" v-if="movie.release_date">
                  <span class="meta-label">Release Year:</span>
                  <span class="meta-value">{{ getReleaseYear(movie.release_date) }}</span>
                </div>

                <div class="meta-item" v-if="movie.vote_average">
                  <span class="meta-label">Rating:</span>
                  <span class="meta-value">{{ movie.vote_average.toFixed(1) }}/10</span>
                </div>

                <div class="meta-item" v-if="movie.runtime">
                  <span class="meta-label">Runtime:</span>
                  <span class="meta-value">{{ formatRuntime(movie.runtime) }}</span>
                </div>

                <div class="meta-item" v-if="movie.vote_count">
                  <span class="meta-label">Votes:</span>
                  <span class="meta-value">{{ movie.vote_count.toLocaleString() }}</span>
                </div>
              </div>

              <div class="genres-section" v-if="movie.genres && movie.genres.length > 0">
                <h3>Genres</h3>
                <div class="genres-list">
                  <span
                    v-for="genre in Array.isArray(movie.genres)
                      ? movie.genres
                      : movie.genres.split(',').map((g) => g.trim())"
                    :key="genre.id || genre"
                    class="genre-tag"
                  >
                    {{ genre.name || genre }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview -->
          <div class="overview-section" v-if="movie.overview">
            <h2 class="section-title">Overview</h2>
            <p class="movie-overview">{{ movie.overview }}</p>
          </div>

          <!-- Additional Details -->
          <div class="additional-details" v-if="movie.budget || movie.revenue || movie.status || movie.popularity">
            <h2 class="section-title">Additional Information</h2>
            <div class="details-grid">
              <div class="detail-item" v-if="movie.budget">
                <span class="detail-label">Budget:</span>
                <span class="detail-value">{{ formatCurrency(movie.budget) }}</span>
              </div>

              <div class="detail-item" v-if="movie.revenue">
                <span class="detail-label">Revenue:</span>
                <span class="detail-value">{{ formatCurrency(movie.revenue) }}</span>
              </div>

              <div class="detail-item" v-if="movie.status">
                <span class="detail-label">Status:</span>
                <span class="detail-value">{{ movie.status }}</span>
              </div>

              <div class="detail-item" v-if="movie.popularity">
                <span class="detail-label">Popularity:</span>
                <span class="detail-value">{{ movie.popularity.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Similar Movies -->
      <section class="results-section" v-if="similarMovies.length > 0">
        <div class="results-header">
          <h2 class="section-title">Similar Movies ({{ getCurrentSimilarityLabel() }})</h2>
          <div class="similarity-controls">
            <select
              v-model="selectedSimilarityType"
              @change="getSimilarMovies"
              class="similarity-select"
            >
              <option v-for="type in similarityTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <div class="limit-controls">
              <button
                @click="currentLimit = 6; getSimilarMovies()"
                :class="{ active: currentLimit === 6 }"
                class="limit-btn"
              >
                6
              </button>
              <button
                @click="currentLimit = 12; getSimilarMovies()"
                :class="{ active: currentLimit === 12 }"
                class="limit-btn"
              >
                12
              </button>
              <button
                @click="currentLimit = 20; getSimilarMovies()"
                :class="{ active: currentLimit === 20 }"
                class="limit-btn"
              >
                20
              </button>
            </div>
          </div>
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
        <div class="action-buttons" style="margin-top: 30px">
          <button @click="router.back()" class="btn secondary">Go Back</button>
          <button @click="router.push('/')" class="btn secondary">Back to Home</button>
        </div>
      </section>

      <!-- No Similar Movies -->
      <section class="empty-state" v-if="movie && similarMovies.length === 0 && !isLoading">
        <div class="empty-content">
          <div class="empty-icon">Search</div>
          <h3>No Similar Movies Found</h3>
          <p>Sorry, we couldn't find any similar movies for "{{ movieTitle }}".</p>
          <div class="action-buttons">
            <button @click="getSimilarMovies()" class="btn secondary">Try Again</button>
            <button @click="router.push('/')" class="btn secondary">Explore More Movies</button>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <section class="empty-state" v-if="isLoading">
        <div class="empty-content">
          <div class="loading-spinner"></div>
          <h3>Loading Movie Details</h3>
          <p>Please wait while we fetch information about {{ movieTitle }}</p>
        </div>
      </section>

      <!-- Error State -->
      <section class="empty-state" v-else-if="!movie && !isLoading">
        <div class="empty-content">
          <div class="empty-icon">Error</div>
          <h3>Movie Not Found</h3>
          <p>Sorry, we couldn't find details for "{{ movieTitle }}".</p>
          <div class="action-buttons">
            <button @click="router.back()" class="btn secondary">Go Back</button>
            <button @click="router.push('/')" class="btn secondary">Explore Movies</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.movie-details-view {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
}

/* Header Section - 统一风格 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 50px 30px;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 16px;
  color: #657166;
  position: relative;
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
  margin: 0 auto 25px auto;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  background: rgba(101, 113, 102, 0.2);
  color: #657166;
  border: 2px solid rgba(101, 113, 102, 0.3);
  padding: 16px 32px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  min-height: 56px;
  min-width: 180px;
  justify-content: center;
}

.action-btn:hover:not(:disabled) {
  background: rgba(101, 113, 102, 0.3);
  border-color: rgba(101, 113, 102, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(153, 205, 216, 0.3);
}

/* Section Title - 统一下划线样式 */
.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #657166;
  margin-bottom: 25px;
  text-align: left;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 2px;
}

/* Movie Details Section */
.movie-details-section {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
  margin-bottom: 40px;
}

.movie-details-container {
  max-width: 1200px;
  margin: 0 auto;
}

.movie-header {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.poster-section {
  flex-shrink: 0;
}

.poster-placeholder {
  width: 300px;
  height: 450px;
  background: linear-gradient(135deg, #DAEBE3 0%, #CFD6C4 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 4px solid #99CDD8;
}

.poster-icon {
  font-size: 3rem;
  opacity: 0.8;
  color: #657166;
  font-weight: 600;
}

.movie-poster {
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.25);
  border-left: 4px solid #99CDD8;
}

.movie-info-section {
  flex: 1;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #657166;
  margin-bottom: 25px;
  line-height: 1.2;
}

.movie-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px;
  background: #DAEBE3;
  border-radius: 8px;
  border-left: 4px solid #99CDD8;
}

.meta-label {
  font-weight: 600;
  color: #657166;
  font-size: 0.9rem;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #657166;
}

.genres-section {
  margin-bottom: 30px;
}

.genres-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #657166;
  margin-bottom: 15px;
}

.genres-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.genre-tag {
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  color: #657166;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.genre-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(153, 205, 216, 0.2);
}

.overview-section {
  margin-bottom: 40px;
  padding: 25px;
  background: #DAEBE3;
  border-radius: 12px;
  border-left: 4px solid #99CDD8;
}

.movie-overview {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #657166;
  margin: 0;
}

.additional-details {
  margin-bottom: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #DAEBE3;
  border-radius: 8px;
  border-left: 4px solid #99CDD8;
}

.detail-label {
  font-weight: 600;
  color: #657166;
}

.detail-value {
  font-weight: 600;
  color: #657166;
}

/* Results Section */
.results-section {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
  margin-bottom: 40px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  flex-wrap: wrap;
  gap: 20px;
}

.similarity-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.similarity-select {
  padding: 12px 16px;
  border: 2px solid #DAEBE3;
  border-radius: 8px;
  background: white;
  color: #657166;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}

.limit-controls {
  display: flex;
  gap: 8px;
}

.limit-btn {
  padding: 8px 16px;
  border: 2px solid #DAEBE3;
  border-radius: 6px;
  background: white;
  color: #657166;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.limit-btn.active {
  background: #99CDD8;
  color: #657166;
  border-color: #99CDD8;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

/* Buttons */
.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
}

.btn.secondary {
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  color: #657166;
}

.btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(153, 205, 216, 0.4);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
  margin-bottom: 40px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
  color: #657166;
  font-weight: 600;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #DAEBE3;
  border-top: 4px solid #99CDD8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #657166;
  margin-bottom: 10px;
}

.empty-state p {
  color: #657166;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .movie-details-view {
    padding: 15px;
  }

  .container {
    padding: 0 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .movie-details-section,
  .results-section {
    padding: 25px;
  }

  .movie-header {
    flex-direction: column;
    gap: 25px;
  }

  .poster-section {
    align-self: center;
  }

  .movie-poster,
  .poster-placeholder {
    width: 250px;
    height: 375px;
  }

  .movie-title {
    font-size: 2rem;
    text-align: center;
  }

  .movie-meta {
    grid-template-columns: 1fr;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .movie-poster,
  .poster-placeholder {
    width: 200px;
    height: 300px;
  }

  .similarity-controls {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
}
</style>