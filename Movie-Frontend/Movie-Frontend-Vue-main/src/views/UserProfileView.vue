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
            <div class="avatar-icon"></div>
          </div>
          <div class="user-badge" v-if="userProfile.total_ratings > 50">Elite Reviewer</div>
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
              <h3>
                {{ (userProfile.avg_rating || 0).toFixed(2) }}
                <span class="rating-icon-small"></span>
              </h3>
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
              <span class="btn-icon"></span>
              Get Recommendations
            </button>
            <button @click="getSimilarUsers" class="btn secondary">
              <span class="btn-icon"></span>
              Find Similar Users
            </button>
          </div>
        </div>
      </section>

      <!-- Rating Distribution -->
      <section class="rating-section">
        <h2 class="section-title">Rating Distribution</h2>
        <div class="rating-distribution">
          <div v-for="item in getRatingDistribution()" :key="item.rating" class="rating-bar">
            <div class="rating-label">
              <span>
                {{ item.rating }}
                <span class="rating-icon-tiny"></span>
              </span>
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
        <h2 class="section-title">Favorite Genres</h2>
        <div class="genres-grid">
          <div v-for="genre in getFavoriteGenres()" :key="genre.name || genre" class="genre-card">
            <h3>{{ genre.name || genre }}</h3>
            <p>{{ genre.count }} movies</p>
            <div class="genre-rating">
              <span class="rating-icon-small"></span>
              {{ (genre.avg_rating || 0).toFixed(1) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section" v-if="userProfile.recent_ratings">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-list">
          <div
            v-for="rating in userProfile.recent_ratings.slice(0, 10)"
            :key="rating.movie_id"
            class="activity-item"
          >
            <div class="activity-rating">
              {{ rating.rating }}
              <span class="rating-icon-tiny"></span>
            </div>
            <div class="activity-movie">
              <h4>{{ rating.movie_title }}</h4>
              <p>{{ new Date(rating.timestamp).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- User Recommendations -->
      <section class="recommendations-section" v-if="recommendations.length > 0">
        <h2 class="section-title">Recommended for User {{ userId }}</h2>
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
        <h2 class="section-title">Similar Users</h2>
        <div class="users-grid">
          <div
            v-for="user in similarUsers"
            :key="user.user_id"
            class="user-card"
            @click="handleUserClick(user.user_id)"
          >
            <div class="user-avatar-small">
              <div class="avatar-icon-small"></div>
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
        <h2 class="section-title">User Insights</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <h3>
              <span class="insight-icon"></span>
              Watching Style
            </h3>
            <p>
              {{
                userProfile.watching_style || 'Balanced watcher who enjoys various genres and eras'
              }}
            </p>
          </div>
          <div class="insight-card">
            <h3>
              <span class="insight-icon"></span>
              Rating Behavior
            </h3>
            <p>
              {{ userProfile.rating_behavior || 'Generous rater who appreciates quality content' }}
            </p>
          </div>
          <div class="insight-card">
            <h3>
              <span class="insight-icon"></span>
              Activity Level
            </h3>
            <p>{{ userProfile.activity_level || 'Active reviewer with diverse taste' }}</p>
          </div>
          <div class="insight-card">
            <h3>
              <span class="insight-icon"></span>
              Preference Profile
            </h3>
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
      <div class="error-icon"></div>
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
  background: #657166;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 30px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: #555;
  transform: translateX(-4px);
}

.user-header {
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.25);
  margin-bottom: 40px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  color: #657166;
}

.user-avatar-section {
  text-align: center;
}

.user-avatar {
  width: 120px;
  height: 120px;
  background: rgba(101, 113, 102, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.3);
}

.avatar-icon {
  width: 48px;
  height: 48px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.user-badge {
  background: rgba(101, 113, 102, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.user-badge::before {
  content: '';
  width: 12px;
  height: 12px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
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
  background: rgba(101, 113, 102, 0.1);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #657166;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stat-card p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  color: #657166;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn .btn-icon {
  width: 18px;
  height: 18px;
}

.btn.primary {
  background: rgba(101, 113, 102, 0.2);
  color: #657166;
  backdrop-filter: blur(10px);
}

.btn.primary .btn-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.btn.primary:hover {
  background: rgba(101, 113, 102, 0.3);
  transform: translateY(-2px);
}

.btn.secondary {
  background: rgba(101, 113, 102, 0.15);
  color: #657166;
  backdrop-filter: blur(10px);
}

.btn.secondary .btn-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.btn.secondary:hover {
  background: rgba(101, 113, 102, 0.25);
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
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #657166;
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
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
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
  color: #657166;
}

.rating-label span:first-child {
  font-weight: 600;
  color: #657166;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-progress {
  height: 24px;
  background: #DAEBE3;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.rating-fill {
  height: 100%;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 12px;
  transition: width 0.5s ease;
}

.rating-percentage {
  text-align: right;
  font-weight: 600;
  color: #99CDD8;
  font-size: 0.9rem;
}

/* 评分图标样式 */
.rating-icon-tiny {
  width: 12px;
  height: 12px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  display: inline-block;
}

.rating-icon-small {
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  display: inline-block;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.genre-card {
  background: linear-gradient(135deg, #DAEBE3 0%, #CFD6C4 100%);
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid #99CDD8;
  transition: transform 0.3s ease;
}

.genre-card:hover {
  transform: translateY(-4px);
}

.genre-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #657166;
  margin: 0 0 8px 0;
}

.genre-card p {
  color: #657166;
  margin: 0 0 10px 0;
}

.genre-rating {
  font-size: 1.1rem;
  font-weight: 600;
  color: #99CDD8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
  background: #DAEBE3;
  border-radius: 10px;
  border-left: 4px solid #99CDD8;
}

.activity-rating {
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  color: #657166;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.activity-movie h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #657166;
  margin: 0 0 5px 0;
}

.activity-movie p {
  color: #657166;
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
  background: linear-gradient(135deg, #DAEBE3 0%, #CFD6C4 100%);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #99CDD8;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.25);
}

.user-avatar-small {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #657166;
  flex-shrink: 0;
}

.avatar-icon-small {
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.user-info-small h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #657166;
  margin: 0 0 5px 0;
}

.user-info-small p {
  color: #657166;
  margin: 2px 0;
  font-size: 0.9rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.insight-card {
  background: linear-gradient(135deg, #DAEBE3 0%, #CFD6C4 100%);
  padding: 30px 25px;
  border-radius: 12px;
  border-left: 4px solid #99CDD8;
}

.insight-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #657166;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-card .insight-icon {
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

.insight-card p {
  color: #657166;
  line-height: 1.6;
  margin: 0;
}

.loading-section,
.error-section {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
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

.error-icon {
  width: 64px;
  height: 64px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  margin: 0 auto 20px;
}

.error-section h2 {
  font-size: 2rem;
  color: #657166;
  margin-bottom: 15px;
}

.error-section p {
  font-size: 1.1rem;
  color: #657166;
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