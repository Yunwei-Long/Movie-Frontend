<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MovieCard from '@/components/MovieCard.vue'
import { useMovieStore } from '@/stores/movies'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()

const userProfile = ref(null)
const recommendations = ref([])
const similarUsers = ref([])
const isLoading = ref(false)

const userId = computed(() => {
  return parseInt(route.params.id)
})

const getUserProfile = async () => {
  try {
    isLoading.value = true
    const profile = await movieStore.getUserProfile(userId.value)
    userProfile.value = profile
  } catch (error) {
    console.error('Failed to get user profile:', error)
  } finally {
    isLoading.value = false
  }
}

const getUserRecommendations = async () => {
  try {
    const results = await movieStore.getUserRecommendations(userId.value, 12)
    recommendations.value = results
  } catch (error) {
    console.error('Failed to get user recommendations:', error)
  }
}

const getSimilarUsers = async () => {
  try {
    const results = await movieStore.getSimilarUsers(userId.value, 8)
    similarUsers.value = results
  } catch (error) {
    console.error('Failed to get similar users:', error)
  }
}

const handleMovieClick = (movie) => {
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleUserClick = (similarUserId) => {
  router.push(`/user/${similarUserId}`)
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat().format(num)
}

const getRatingDistribution = () => {
  if (!userProfile.value?.rating_distribution) return []

  const distribution = []
  for (let i = 1; i <= 5; i++) {
    const count = userProfile.value.rating_distribution[i] || 0
    distribution.push({
      rating: i,
      count,
      percentage: userProfile.value.total_ratings
        ? ((count / userProfile.value.total_ratings) * 100).toFixed(1)
        : 0,
    })
  }
  return distribution
}

const getFavoriteGenres = () => {
  if (!userProfile.value?.favorite_genres) return []
  return userProfile.value.favorite_genres.slice(0, 5)
}

onMounted(async () => {
  await Promise.all([getUserProfile(), getUserRecommendations(), getSimilarUsers()])
})
</script>

<template>
  <div class="user-profile-view">
    <div class="container" v-if="userProfile">
      <!-- Back Button -->
      <button @click="router.back()" class="back-btn">← Back to Previous Page</button>

      <!-- User Header -->
      <section class="user-header">
        <div class="user-avatar-section">
          <div class="user-avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <div class="user-badge" v-if="userProfile.total_ratings > 50">🏆 Elite Reviewer</div>
        </div>

        <div class="user-info">
          <h1 class="user-title">User {{ userId }}</h1>
          <p class="user-subtitle">Movie Enthusiast & Reviewer</p>

          <div class="user-stats-grid">
            <div class="stat-card">
              <h3>{{ formatNumber(userProfile.total_ratings) }}</h3>
              <p>Total Ratings</p>
            </div>
            <div class="stat-card">
              <h3>{{ (userProfile.avg_rating || 0).toFixed(2) }} ⭐</h3>
              <p>Average Rating</p>
            </div>
            <div class="stat-card">
              <h3>{{ userProfile.unique_genres || 'N/A' }}</h3>
              <p>Genres Explored</p>
            </div>
            <div class="stat-card">
              <h3>{{ userProfile.decades_active || 'N/A' }}</h3>
              <p>Decades Active</p>
            </div>
          </div>

          <div class="user-actions">
            <button @click="getUserRecommendations" class="btn primary">
              🎯 Get Recommendations
            </button>
            <button @click="getSimilarUsers" class="btn secondary">🔗 Find Similar Users</button>
          </div>
        </div>
      </section>

      <!-- Rating Distribution -->
      <section class="rating-section">
        <h2 class="section-title">📊 Rating Distribution</h2>
        <div class="rating-distribution">
          <div v-for="item in getRatingDistribution()" :key="item.rating" class="rating-bar">
            <div class="rating-label">
              <span>{{ item.rating }} ⭐</span>
              <span>{{ item.count }} ratings</span>
            </div>
            <div class="rating-progress">
              <div class="rating-fill" :style="{ width: item.percentage + '%' }"></div>
            </div>
            <div class="rating-percentage">{{ item.percentage }}%</div>
          </div>
        </div>
      </section>

      <!-- Favorite Genres -->
      <section class="genres-section" v-if="getFavoriteGenres().length > 0">
        <h2 class="section-title">🎭 Favorite Genres</h2>
        <div class="genres-grid">
          <div v-for="genre in getFavoriteGenres()" :key="genre.name || genre" class="genre-card">
            <h3>{{ genre.name || genre }}</h3>
            <p>{{ genre.count }} movies</p>
            <div class="genre-rating">⭐ {{ (genre.avg_rating || 0).toFixed(1) }}</div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section" v-if="userProfile.recent_ratings">
        <h2 class="section-title">🕒 Recent Activity</h2>
        <div class="activity-list">
          <div
            v-for="rating in userProfile.recent_ratings.slice(0, 10)"
            :key="rating.movie_id"
            class="activity-item"
          >
            <div class="activity-rating">{{ rating.rating }} ⭐</div>
            <div class="activity-movie">
              <h4>{{ rating.movie_title }}</h4>
              <p>{{ new Date(rating.timestamp).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- User Recommendations -->
      <section class="recommendations-section" v-if="recommendations.length > 0">
        <h2 class="section-title">🎯 Recommended for User {{ userId }}</h2>
        <div class="movies-grid">
          <MovieCard
            v-for="movie in recommendations"
            :key="movie.id || movie.title"
            :movie="movie"
            @click="handleMovieClick"
            :show-metadata="false"
          />
        </div>
      </section>

      <!-- Similar Users -->
      <section class="similar-users-section" v-if="similarUsers.length > 0">
        <h2 class="section-title">🔗 Similar Users</h2>
        <div class="users-grid">
          <div
            v-for="user in similarUsers"
            :key="user.user_id"
            class="user-card"
            @click="handleUserClick(user.user_id)"
          >
            <div class="user-avatar-small">
              <span>👤</span>
            </div>
            <div class="user-info-small">
              <h4>User {{ user.user_id }}</h4>
              <p>Similarity: {{ (user.similarity_score * 100).toFixed(1) }}%</p>
              <p v-if="user.common_ratings">{{ user.common_ratings }} movies in common</p>
              <p v-if="user.rating_correlation">
                Correlation: {{ user.rating_correlation.toFixed(3) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Insights Section -->
      <section class="insights-section">
        <h2 class="section-title">💡 User Insights</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <h3>🎬 Watching Style</h3>
            <p>
              {{
                userProfile.watching_style || 'Balanced watcher who enjoys various genres and eras'
              }}
            </p>
          </div>
          <div class="insight-card">
            <h3>🏆 Rating Behavior</h3>
            <p>
              {{ userProfile.rating_behavior || 'Generous rater who appreciates quality content' }}
            </p>
          </div>
          <div class="insight-card">
            <h3>📈 Activity Level</h3>
            <p>{{ userProfile.activity_level || 'Active reviewer with diverse taste' }}</p>
          </div>
          <div class="insight-card">
            <h3>🎯 Preference Profile</h3>
            <p>{{ userProfile.preference_profile || 'Enjoys both mainstream and indie films' }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Loading user profile...</p>
    </div>

    <!-- Error State -->
    <div v-else class="error-section">
      <div class="error-icon">❌</div>
      <h2>User Not Found</h2>
      <p>Sorry, we couldn't find the profile for User {{ userId }}.</p>
      <button @click="router.back()" class="btn primary">Go Back</button>
    </div>
  </div>
</template>

<style scoped>
.user-profile-view {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateX(-4px);
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  color: white;
}

.user-avatar-section {
  text-align: center;
}

.user-avatar {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.avatar-icon {
  font-size: 4rem;
}

.user-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.user-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.user-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 30px 0;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.stat-card p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.user-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn.primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
}

.rating-section,
.genres-section,
.activity-section,
.recommendations-section,
.similar-users-section,
.insights-section {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
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

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-bar {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  gap: 15px;
  align-items: center;
}

.rating-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
  color: #666;
}

.rating-label span:first-child {
  font-weight: 600;
  color: #333;
}

.rating-progress {
  height: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.rating-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  transition: width 0.5s ease;
}

.rating-percentage {
  text-align: right;
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.genre-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid #667eea;
  transition: transform 0.3s ease;
}

.genre-card:hover {
  transform: translateY(-4px);
}

.genre-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.genre-card p {
  color: #666;
  margin: 0 0 10px 0;
}

.genre-rating {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.activity-rating {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.activity-movie h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.activity-movie p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.user-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.user-avatar-small {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.user-info-small h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.user-info-small p {
  color: #666;
  margin: 2px 0;
  font-size: 0.9rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.insight-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30px 25px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.insight-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.loading-section,
.error-section {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-section h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 15px;
}

.error-section p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 25px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .user-profile-view {
    padding: 15px;
  }

  .user-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 30px;
    padding: 30px 20px;
  }

  .user-avatar {
    margin: 0 auto 15px auto;
  }

  .user-title {
    font-size: 2rem;
  }

  .user-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .user-actions {
    justify-content: center;
  }

  .rating-section,
  .genres-section,
  .activity-section,
  .recommendations-section,
  .similar-users-section,
  .insights-section {
    padding: 30px 20px;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .rating-bar {
    grid-template-columns: 100px 1fr 50px;
    gap: 10px;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }

  .users-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .user-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .user-stats-grid {
    grid-template-columns: 1fr;
  }

  .rating-bar {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .rating-label {
    flex-direction: row;
    justify-content: space-between;
  }

  .rating-percentage {
    text-align: left;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
