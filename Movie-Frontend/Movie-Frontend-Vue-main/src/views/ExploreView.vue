<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MovieCard from '@/components/MovieCard.vue'
import { useMovieStore } from '@/stores/movies'

const router = useRouter()
const movieStore = useMovieStore()

const randomMovies = ref([])
const systemStats = ref(null)
const isLoadingRandom = ref(false)
const isLoadingStats = ref(false)

const getRandomMovies = async (count = 12) => {
  isLoadingRandom.value = true
  try {
    await movieStore.getRandomMovies(count)
    // Use the enhanced random movies from the store
    randomMovies.value = movieStore.randomMovies
  } catch (error) {
    console.error('Failed to get random movies:', error)
  } finally {
    isLoadingRandom.value = false
  }
}

const getSystemStats = async () => {
  isLoadingStats.value = true
  try {
    const stats = await movieStore.getCollaborativeStats()
    systemStats.value = stats
  } catch (error) {
    console.error('Failed to get system stats:', error)
  } finally {
    isLoadingStats.value = false
  }
}

const handleMovieClick = (movie) => {
  console.log('ExploreView handleMovieClick - movie:', movie)
  console.log('ExploreView handleMovieClick - movie.title:', movie?.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleMovieDetails = async (movie) => {
  await movieStore.getMovieDetails(movie.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const refreshData = async () => {
  await Promise.all([getRandomMovies(12), getSystemStats()])
}

onMounted(refreshData)
</script>

<template>
  <div class="explore-view">
    <div class="container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <h1 class="page-title">🔍 Explore</h1>
          <p class="page-description">
            Discover random movies and explore the rich features of our movie recommendation system
          </p>
          <div class="header-actions">
            <button @click="router.push('/content-based')" class="action-btn content">
              <span class="btn-icon">🎭</span>
              Content-Based
            </button>
            <button
              @click="refreshData"
              class="action-btn refresh"
              :disabled="isLoadingRandom || isLoadingStats"
            >
              <span class="btn-icon">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </section>

      <!-- System Statistics -->
      <section class="stats-section">
        <h2 class="section-title">📊 System Statistics</h2>
        <div class="stats-grid" v-if="systemStats">
          <div class="stat-card">
            <div class="stat-icon">🎬</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_movies?.toLocaleString() || '4,803' }}</h3>
              <p>Total Movies</p>
              <small>Complete TMDB dataset</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_ratings?.toLocaleString() || '50K' }}</h3>
              <p>Total Ratings</p>
              <small>Movie ratings from TMDB</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <h3>{{ (systemStats.avg_rating || 4.2).toFixed(2) }}</h3>
              <p>Average Rating</p>
              <small>System-wide average</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏷️</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_genres?.toLocaleString() || '20' }}</h3>
              <p>Movie Genres</p>
              <small>Genre categories</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_keywords?.toLocaleString() || '9,504' }}</h3>
              <p>Keywords</p>
              <small>Movie tags & keywords</small>
            </div>
          </div>
        </div>
        <div class="loading-stats" v-else-if="isLoadingStats">
          <div class="loading-spinner"></div>
          <p>Loading system statistics...</p>
        </div>
      </section>

      <!-- Random Movies Discovery -->
      <section class="movies-section">
        <div class="section-header">
          <h2 class="section-title">🎲 Random Movie Discovery</h2>
          <div class="section-controls">
            <button @click="getRandomMovies(6)" class="btn secondary" :disabled="isLoadingRandom">
              Load 6 Movies
            </button>
            <button @click="getRandomMovies(12)" class="btn secondary" :disabled="isLoadingRandom">
              Load 12 Movies
            </button>
            <button @click="getRandomMovies(20)" class="btn secondary" :disabled="isLoadingRandom">
              Load 20 Movies
            </button>
          </div>
        </div>

        <div class="movies-grid" v-if="randomMovies.length > 0">
          <MovieCard
            v-for="movie in randomMovies"
            :key="movie.id || movie.title"
            :movie="movie"
            @click="handleMovieClick"
            @show-details="handleMovieDetails"
          />
        </div>

        <div class="loading-section" v-else-if="isLoadingRandom">
          <div class="loading-spinner"></div>
          <p>Discovering amazing movies for you...</p>
        </div>

        <div class="empty-section" v-else>
          <p>Click the buttons above to discover random movies!</p>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section">
        <h2 class="section-title">⚡ Quick Actions</h2>
        <div class="actions-grid">
          <button @click="router.push('/content-based')" class="action-card">
            <span class="action-icon">🎭</span>
            <h3>Content-Based</h3>
            <p>Get recommendations based on movie content</p>
          </button>

          <button @click="getRandomMovies(1)" class="action-card">
            <span class="action-icon">🎲</span>
            <h3>Surprise Me</h3>
            <p>Get a single random movie suggestion</p>
          </button>

          <button @click="getSystemStats" class="action-card">
            <span class="action-icon">📊</span>
            <h3>Update Stats</h3>
            <p>Refresh system statistics</p>
          </button>
        </div>
      </section>

      <!-- System Features -->
      <section class="features-section">
        <h2 class="section-title">🌟 System Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>🎬 Rich Movie Database</h3>
            <p>
              Access to 4,800+ movies with detailed metadata including genres, keywords, cast, crew,
              and production information.
            </p>
          </div>
          <div class="feature-card">
            <h3>🤖 Advanced ML Algorithms</h3>
            <p>
              State-of-the-art recommendation algorithms including collaborative filtering and
              content-based filtering.
            </p>
          </div>
          <div class="feature-card">
            <h3>⚡ Real-time Recommendations</h3>
            <p>
              Get instant movie recommendations without waiting - our system is optimized for speed
              and accuracy.
            </p>
          </div>
          <div class="feature-card">
            <h3>🔍 Multiple Search Methods</h3>
            <p>
              Search movies by title, explore random selections, or get personalized recommendations
              based on your preferences.
            </p>
          </div>
          <div class="feature-card">
            <h3>📊 Detailed Analytics</h3>
            <p>Comprehensive statistics about the movie database and recommendation performance.</p>
          </div>
          <div class="feature-card">
            <h3>🎭 Content Analysis</h3>
            <p>
              Advanced content analysis using genres, keywords, cast, and production companies for
              better recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.explore-view {
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
  padding: 50px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn.content {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.5);
}

.action-btn.content:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.4);
  border-color: rgba(255, 193, 7, 0.7);
}

.action-btn.collaborative {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.5);
}

.action-btn.collaborative:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.4);
  border-color: rgba(76, 175, 80, 0.7);
}

.action-btn.refresh {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.action-btn.refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
  animation: none;
}

.refresh-btn:disabled .refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.stats-section {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.stat-content p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.stat-content small {
  color: #666;
  font-size: 0.9rem;
}

.movies-section,
.actions-section,
.features-section {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge.gold {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.badge.silver {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.badge.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.action-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: none;
  padding: 30px 25px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 15px;
}

.action-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.action-card p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.feature-card {
  background: #f8f9fa;
  padding: 30px 25px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.loading-stats,
.loading-section,
.empty-section {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.empty-section {
  background: #f8f9fa;
  border-radius: 12px;
  font-style: italic;
}

@media (max-width: 768px) {
  .explore-view {
    padding: 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    padding: 25px;
  }

  .movies-section,
  .actions-section,
  .features-section,
  .stats-section {
    padding: 35px 25px;
  }

  .section-header {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .section-controls {
    justify-content: center;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 25px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .action-card {
    padding: 25px 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .page-description {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }

  .header-actions {
    gap: 12px;
  }

  .action-btn {
    padding: 14px 28px;
    font-size: 1rem;
    min-height: 50px;
    min-width: 160px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content h3 {
    font-size: 1.8rem;
  }
}
</style>
