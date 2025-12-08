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
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleMovieDetails = async (movie) => {
  await movieStore.getMovieDetails(movie.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const initializeData = async () => {
  await Promise.all([getRandomMovies(12), getSystemStats()])
}

onMounted(initializeData)
</script>

<template>
  <div class="explore-view">
    <div class="container">
      <!-- Hero Header Section -->
      <section class="header-section">
        <div class="header-background"></div>
        <div class="header-content">
          <!-- 移除了 Discover 徽章 -->
          <h1 class="page-title">Explore Movies</h1>
          <p class="page-description">
            Discover thousands of amazing films and explore our intelligent recommendation system powered by advanced machine learning
          </p>
          <div class="header-actions">
            <button @click="router.push('/content-based')" class="action-btn primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span class="btn-text">Content-Based Recommendations</span>
            </button>
          </div>
        </div>
      </section>

      <!-- System Statistics -->
      <section class="stats-section">
        <div class="section-header-wrapper">
          <h2 class="section-title">System Statistics</h2>
          <p class="section-subtitle">Real-time insights into our movie database</p>
        </div>
        
        <div class="stats-grid" v-if="systemStats && !isLoadingStats">
          <div class="stat-card" v-for="(stat, index) in [
            { 
              value: systemStats.total_movies?.toLocaleString() || '4,803', 
              label: 'Total Movies', 
              desc: 'Complete TMDB dataset',
              icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z'
            },
            { 
              value: systemStats.total_ratings?.toLocaleString() || '50K', 
              label: 'Total Ratings', 
              desc: 'User ratings collected',
              icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
            },
            { 
              value: (systemStats.avg_rating || 4.2).toFixed(2), 
              label: 'Average Rating', 
              desc: 'System-wide average',
              icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
            },
            { 
              value: systemStats.total_genres?.toLocaleString() || '20', 
              label: 'Movie Genres', 
              desc: 'Genre categories',
              icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z'
            },
            { 
              value: systemStats.total_keywords?.toLocaleString() || '9,504', 
              label: 'Keywords', 
              desc: 'Movie tags & keywords',
              icon: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
            }
          ]" :key="index" :style="{ animationDelay: `${index * 0.08}s` }">
            <div class="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path :d="stat.icon"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stat.value }}</h3>
              <p>{{ stat.label }}</p>
              <small>{{ stat.desc }}</small>
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
        <div class="section-header-wrapper">
          <div class="section-header">
            <div>
              <h2 class="section-title">Random Movie Discovery</h2>
              <p class="section-subtitle">Explore our curated collection of films</p>
            </div>
            <div class="section-controls">
              <button @click="getRandomMovies(6)" class="btn secondary" :disabled="isLoadingRandom">
                <span>6 Movies</span>
              </button>
              <button @click="getRandomMovies(12)" class="btn secondary" :disabled="isLoadingRandom">
                <span>12 Movies</span>
              </button>
              <button @click="getRandomMovies(20)" class="btn secondary" :disabled="isLoadingRandom">
                <span>20 Movies</span>
              </button>
            </div>
          </div>
        </div>

        <transition-group name="fade" tag="div" class="movies-grid" v-if="randomMovies.length > 0 && !isLoadingRandom">
          <MovieCard
            v-for="movie in randomMovies"
            :key="movie.id || movie.title"
            :movie="movie"
            @click="handleMovieClick"
            @show-details="handleMovieDetails"
          />
        </transition-group>

        <div class="loading-section" v-else-if="isLoadingRandom">
          <div class="loading-spinner large"></div>
          <p>Discovering amazing movies for you...</p>
        </div>

        <div class="empty-section" v-else>
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h3>Ready to Explore?</h3>
          <p>Click the buttons above to discover random movies from our collection</p>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section">
        <div class="section-header-wrapper">
          <h2 class="section-title">Quick Actions</h2>
          <p class="section-subtitle">Fast access to key features</p>
        </div>
        <div class="actions-grid">
          <button @click="router.push('/content-based')" class="action-card">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Content-Based Filtering</h3>
              <p>Get personalized recommendations based on movie attributes, genres, keywords, and production details</p>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>

          <button @click="getRandomMovies(1)" class="action-card">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Surprise Me</h3>
              <p>Discover a random movie from our extensive collection and explore something new</p>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>

          <button @click="getSystemStats" class="action-card">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="action-content">
              <h3>Update Statistics</h3>
              <p>Refresh system statistics to see the latest data and insights from our database</p>
            </div>
            <div class="action-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>
        </div>
      </section>

      <!-- System Features -->
      <section class="features-section">
        <div class="section-header-wrapper">
          <h2 class="section-title">System Features</h2>
          <p class="section-subtitle">Powered by cutting-edge technology</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in [
            { 
              title: 'Rich Movie Database', 
              desc: 'Access to 4,800+ movies with detailed metadata including genres, keywords, cast, crew, and production information from TMDB.',
              icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z'
            },
            { 
              title: 'Advanced ML Algorithms', 
              desc: 'State-of-the-art recommendation algorithms including collaborative filtering, content-based filtering, and hybrid approaches.',
              icon: 'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
            },
            { 
              title: 'Real-time Recommendations', 
              desc: 'Get instant movie recommendations without waiting - our system is optimized for speed and accuracy with efficient caching.',
              icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z'
            },
            { 
              title: 'Multiple Search Methods', 
              desc: 'Search movies by title, explore random selections, or get personalized recommendations based on your viewing preferences.',
              icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
            },
            { 
              title: 'Detailed Analytics', 
              desc: 'Comprehensive statistics about the movie database, user ratings, and recommendation system performance metrics.',
              icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
            },
            { 
              title: 'Content Analysis', 
              desc: 'Advanced content analysis using genres, keywords, cast, crew, and production companies for highly accurate recommendations.',
              icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
            }
          ]" :key="index" :style="{ animationDelay: `${index * 0.05}s` }">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path :d="feature.icon"/>
              </svg>
            </div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.explore-view {
  min-height: 100vh;
  padding: 32px 0 80px;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Hero Header - 统一色调，增强玻璃质感 */
.header-section {
  position: relative;
  text-align: center;
  margin-bottom: 56px;
  padding: 80px 48px;
  /* 统一的浅青色调玻璃渐变 */
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.9) 0%, rgba(225, 240, 235, 0.95) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(184, 213, 198, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.header-background {
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
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #2C3E3F;
  letter-spacing: -1px;
}

.page-description {
  font-size: 1.2rem;
  color: #4A5568;
  max-width: 720px;
  margin: 0 auto 40px;
  line-height: 1.8;
}

.header-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(153, 205, 216, 0.3);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(153, 205, 216, 0.4);
}

/* Section Headers */
.section-header-wrapper {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2C3E3F;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #718096;
  font-weight: 500;
}

/* Stats Section - 统一色调 */
.stats-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 56px 48px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  margin-bottom: 56px;
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 28px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.85) 0%, rgba(225, 240, 235, 0.85) 100%);
  padding: 32px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid rgba(184, 213, 198, 0.4);
  animation: fadeInUp 0.6s ease-out backwards;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(153, 205, 216, 0.25);
  border-color: #99CDD8;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
}

.stat-content h3 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2C3E3F;
  margin: 0 0 8px 0;
}

.stat-content p {
  font-size: 1.1rem;
  font-weight: 700;
  color: #4A5D5E;
  margin: 0 0 6px 0;
}

.stat-content small {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Movies Section - 统一色调 */
.movies-section,
.actions-section,
.features-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 56px 48px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  margin-bottom: 56px;
  border: 1px solid rgba(184, 213, 198, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 40px;
}

.section-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.2);
}

.btn.secondary {
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(153, 205, 216, 0.35);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-leave-to {
  opacity: 0;
}

/* Loading & Empty States - 统一色调 */
.loading-section,
.loading-stats,
.empty-section {
  text-align: center;
  padding: 64px 32px;
  color: #4A5568;
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 5px solid rgba(184, 213, 198, 0.3);
  border-top: 5px solid #99CDD8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 24px;
}

.loading-spinner.large {
  width: 72px;
  height: 72px;
  border-width: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-section {
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.6) 0%, rgba(225, 240, 235, 0.6) 100%);
  border-radius: 20px;
  border: 2px dashed rgba(184, 213, 198, 0.5);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.2) 0%, rgba(184, 213, 198, 0.2) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #99CDD8;
}

.empty-section h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2C3E3F;
  margin-bottom: 12px;
}

.empty-section p {
  font-size: 1.05rem;
  color: #718096;
}

/* Actions Grid - 统一色调 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 28px;
}

.action-card {
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.7) 0%, rgba(225, 240, 235, 0.7) 100%);
  border: 2px solid rgba(184, 213, 198, 0.4);
  padding: 32px;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(153, 205, 216, 0.25);
  border-color: #99CDD8;
}

.action-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2C3E3F;
  margin-bottom: 8px;
}

.action-content p {
  color: #718096;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.action-arrow {
  color: #99CDD8;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(6px);
}

/* Features Grid - 统一色调 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
}
.feature-card {
  background: linear-gradient(135deg, rgba(235, 248, 245, 0.7) 0%, rgba(225, 240, 235, 0.7) 100%);
  padding: 32px;
  border-radius: 18px;
  border: 2px solid rgba(184, 213, 198, 0.4);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out backwards;
  display: flex;
  gap: 20px;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(153, 205, 216, 0.25);
  border-color: #99CDD8;
}
.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.feature-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2C3E3F;
  margin-bottom: 10px;
}
.feature-content p {
  color: #718096;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .stats-grid,
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  .header-section {
    padding: 56px 32px;
    margin-bottom: 40px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .page-description {
    font-size: 1.05rem;
  }
  .stats-section,
  .movies-section,
  .actions-section,
  .features-section {
    padding: 40px 32px;
    margin-bottom: 40px;
  }
  .section-title {
    font-size: 2rem;
  }
  .section-header {
    flex-direction: column;
  }
  .stats-grid,
  .actions-grid,
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  .header-section {
    padding: 40px 24px;
  }
  .page-title {
    font-size: 2rem;
  }
  .page-description {
    font-size: 1rem;
  }
  .section-title {
    font-size: 1.75rem;
  }
  .stats-section,
  .movies-section,
  .actions-section,
  .features-section {
    padding: 32px 24px;
  }
  .movies-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .action-card,
  .feature-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>