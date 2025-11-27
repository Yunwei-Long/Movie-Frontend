<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'
import MovieCard from '@/components/MovieCard.vue'
import { useMovieStore } from '@/stores/movies'

const router = useRouter()
const movieStore = useMovieStore()

const selectedUserId = ref(1)
const selectedMovieName = ref('')
const userRecommendations = ref([])
const similarUsers = ref([])
const similarMoviesByName = ref([])
const topUsers = ref([])
const systemStats = ref(null)
const activeTab = ref('users')

const getRecommendationsForUser = async () => {
  try {
    const results = await movieStore.getUserRecommendations(selectedUserId.value, 12)
    userRecommendations.value = results
  } catch (error) {
    console.error('Failed to get user recommendations:', error)
  }
}

const getSimilarUsers = async () => {
  try {
    const results = await movieStore.getSimilarUsers(selectedUserId.value, 8)
    similarUsers.value = results
  } catch (error) {
    console.error('Failed to get similar users:', error)
  }
}

const getSimilarMoviesByName = async () => {
  if (!selectedMovieName.value.trim()) return

  try {
    const results = await movieStore.searchMovies(selectedMovieName.value, 10)
    similarMoviesByName.value = results
  } catch (error) {
    console.error('Failed to get similar movies by name:', error)
  }
}

const getTopUsers = async () => {
  try {
    const results = await movieStore.getTopUsers(10)
    topUsers.value = results
  } catch (error) {
    console.error('Failed to get top users:', error)
  }
}

const getSystemStats = async () => {
  try {
    const stats = await movieStore.getCollaborativeStats()
    systemStats.value = stats
  } catch (error) {
    console.error('Failed to get system stats:', error)
  }
}

const handleMovieSearch = async (searchData) => {
  selectedMovieName.value = searchData.query
  await getSimilarMoviesByName()
}

const handleMovieClick = (movie) => {
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleMovieDetails = async (movie) => {
  await movieStore.getMovieDetails(movie.title)
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleUserClick = (userId) => {
  selectedUserId.value = userId
  getRecommendationsForUser()
  getSimilarUsers()
  activeTab.value = 'recommendations'
}

onMounted(async () => {
  await Promise.all([getRecommendationsForUser(), getTopUsers(), getSystemStats()])
})
</script>

<template>
  <div class="collaborative-view">
    <div class="container">
      <!-- Header Section -->
      <section class="header-section">
        <div class="header-content">
          <h1 class="page-title">👥 Collaborative Filtering</h1>
          <p class="page-description">
            Discover movies through collaborative filtering - find recommendations based on similar
            users' preferences and ratings
          </p>
        </div>
      </section>

      <!-- System Stats -->
      <section class="stats-section" v-if="systemStats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎬</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_movies?.toLocaleString() || '4,803' }}</h3>
              <p>Total Movies</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_users?.toLocaleString() || '1,000' }}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>{{ systemStats.total_ratings?.toLocaleString() || '50K' }}</h3>
              <p>Total Ratings</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ (systemStats.avg_rating || 4.2).toFixed(2) }}</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab Navigation -->
      <section class="tab-section">
        <div class="tab-nav">
          <button
            @click="activeTab = 'recommendations'"
            :class="['tab-btn', { active: activeTab === 'recommendations' }]"
          >
            🎯 User Recommendations
          </button>
          <button
            @click="activeTab = 'users'"
            :class="['tab-btn', { active: activeTab === 'users' }]"
          >
            🏆 Top Users
          </button>
          <button
            @click="activeTab = 'similar'"
            :class="['tab-btn', { active: activeTab === 'similar' }]"
          >
            🔗 Similar Users
          </button>
          <button
            @click="activeTab = 'movie-search'"
            :class="['tab-btn', { active: activeTab === 'movie-search' }]"
          >
            🎬 Movie-Based Search
          </button>
        </div>
      </section>

      <!-- User Recommendations Tab -->
      <section class="tab-content" v-show="activeTab === 'recommendations'">
        <div class="controls-section">
          <div class="user-input-group">
            <label for="user-id">User ID:</label>
            <input
              id="user-id"
              v-model.number="selectedUserId"
              type="number"
              min="1"
              max="1000"
              class="user-input"
            />
            <button @click="getRecommendationsForUser" class="btn primary">
              Get Recommendations
            </button>
            <button @click="getSimilarUsers" class="btn secondary">Find Similar Users</button>
          </div>
          <div class="quick-users">
            <span>Quick access:</span>
            <button
              v-for="id in [1, 42, 100, 250, 500]"
              :key="id"
              @click="
                selectedUserId = id
                getRecommendationsForUser()
              "
              class="quick-user-btn"
            >
              User {{ id }}
            </button>
          </div>
        </div>

        <!-- User Profile -->
        <div class="user-profile-section" v-if="movieStore.userProfile">
          <h3>👤 User {{ selectedUserId }} Profile</h3>
          <div class="profile-stats">
            <div class="profile-stat">
              <span class="stat-label">Total Ratings:</span>
              <span class="stat-value">{{ movieStore.userProfile.total_ratings || 'N/A' }}</span>
            </div>
            <div class="profile-stat">
              <span class="stat-label">Average Rating:</span>
              <span class="stat-value"
                >{{ (movieStore.userProfile.avg_rating || 0).toFixed(2) }} ⭐</span
              >
            </div>
            <div class="profile-stat">
              <span class="stat-label">Favorite Genres:</span>
              <span class="stat-value">{{
                movieStore.userProfile.favorite_genres?.join(', ') || 'N/A'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Recommendations Results -->
        <div class="results-section" v-if="userRecommendations.length > 0">
          <div class="results-header">
            <h2>🎯 Recommendations for User {{ selectedUserId }}</h2>
            <p class="results-count">{{ userRecommendations.length }} movies recommended</p>
          </div>
          <div class="movies-grid">
            <MovieCard
              v-for="movie in userRecommendations"
              :key="movie.id || movie.title"
              :movie="movie"
              @click="handleMovieClick"
              @show-details="handleMovieDetails"
            />
          </div>
        </div>

        <!-- Similar Users -->
        <div class="similar-users-section" v-if="similarUsers.length > 0">
          <h2>🔗 Similar Users</h2>
          <div class="users-grid">
            <div
              v-for="user in similarUsers"
              :key="user.user_id"
              class="user-card"
              @click="handleUserClick(user.user_id)"
            >
              <div class="user-avatar">👤</div>
              <div class="user-info">
                <h4>User {{ user.user_id }}</h4>
                <p>Similarity: {{ (user.similarity_score * 100).toFixed(1) }}%</p>
                <p v-if="user.common_ratings">{{ user.common_ratings }} movies in common</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Top Users Tab -->
      <section class="tab-content" v-show="activeTab === 'users'">
        <div class="controls-section">
          <button @click="getTopUsers" class="btn primary">🔄 Refresh Top Users</button>
        </div>

        <div class="top-users-section" v-if="topUsers.length > 0">
          <h2>🏆 Most Active Users</h2>
          <div class="users-grid">
            <div
              v-for="(user, index) in topUsers"
              :key="user.user_id"
              class="user-card top-user"
              @click="handleUserClick(user.user_id)"
            >
              <div class="user-rank">#{{ index + 1 }}</div>
              <div class="user-avatar">👤</div>
              <div class="user-info">
                <h4>User {{ user.user_id }}</h4>
                <p>{{ user.total_ratings }} ratings</p>
                <p>Avg: {{ (user.avg_rating || 0).toFixed(2) }} ⭐</p>
                <div class="user-badge" v-if="index === 0">👑 Top Reviewer</div>
                <div class="user-badge" v-else-if="index < 3">⭐ Elite User</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Similar Users Tab -->
      <section class="tab-content" v-show="activeTab === 'similar'">
        <div class="controls-section">
          <div class="user-input-group">
            <label for="similar-user-id">Find users similar to:</label>
            <input
              id="similar-user-id"
              v-model.number="selectedUserId"
              type="number"
              min="1"
              max="1000"
              class="user-input"
            />
            <button @click="getSimilarUsers" class="btn primary">Find Similar Users</button>
          </div>
        </div>

        <div class="similar-users-section" v-if="similarUsers.length > 0">
          <h2>🔗 Users Similar to User {{ selectedUserId }}</h2>
          <div class="users-grid">
            <div
              v-for="user in similarUsers"
              :key="user.user_id"
              class="user-card"
              @click="handleUserClick(user.user_id)"
            >
              <div class="user-avatar">👤</div>
              <div class="user-info">
                <h4>User {{ user.user_id }}</h4>
                <p>Similarity: {{ (user.similarity_score * 100).toFixed(1) }}%</p>
                <p v-if="user.common_ratings">{{ user.common_ratings }} movies in common</p>
                <p v-if="user.rating_correlation">
                  Correlation: {{ user.rating_correlation.toFixed(3) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Movie-Based Search Tab -->
      <section class="tab-content" v-show="activeTab === 'movie-search'">
        <div class="search-section">
          <h2>🎬 Find Movies Based on Collaborative Filtering</h2>
          <SearchBar
            placeholder="Enter a movie name to find similar movies based on user ratings..."
            @search="handleMovieSearch"
          />
        </div>

        <!-- Results -->
        <div class="results-section" v-if="similarMoviesByName.length > 0">
          <div class="results-header">
            <h2>🎯 Movies Similar to "{{ selectedMovieName }}"</h2>
            <p class="results-count">{{ similarMoviesByName.length }} movies found</p>
          </div>
          <div class="movies-grid">
            <MovieCard
              v-for="movie in similarMoviesByName"
              :key="movie.id || movie.title"
              :movie="movie"
              @click="handleMovieClick"
              @show-details="handleMovieDetails"
            />
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="info-section">
        <div class="info-content">
          <h2>🤝 How Collaborative Filtering Works</h2>
          <div class="info-grid">
            <div class="info-card">
              <h4>👥 User Similarity</h4>
              <p>
                We analyze user ratings to find people with similar taste patterns. If you and
                another user rate movies similarly, their preferences can help predict yours.
              </p>
            </div>
            <div class="info-card">
              <h4>🎬 Movie Similarity</h4>
              <p>
                Movies that are rated similarly by the same users are considered alike. If you liked
                one movie, you'll probably enjoy similar ones.
              </p>
            </div>
            <div class="info-card">
              <h4>🔮 Predictive Analytics</h4>
              <p>
                Our algorithm uses matrix factorization to learn latent features from user-movie
                interactions, enabling accurate predictions for unseen movies.
              </p>
            </div>
            <div class="info-card">
              <h4>📊 Rating Patterns</h4>
              <p>
                The system identifies patterns in how different user groups rate movies, creating
                personalized recommendations based on your rating history.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.collaborative-view {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
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

.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.stat-content p {
  color: #666;
  margin: 0;
  font-weight: 500;
}

.tab-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.tab-nav {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 0 0 12px 12px;
}

.controls-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-input-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.user-input-group label {
  font-weight: 600;
  color: #333;
  min-width: 140px;
}

.user-input {
  width: 120px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.3s ease;
}

.user-input:focus {
  outline: none;
  border-color: #667eea;
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

.quick-users {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-users span {
  font-weight: 600;
  color: #333;
}

.quick-user-btn {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.quick-user-btn:hover {
  background: #667eea;
  color: white;
}

.user-profile-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  border-left: 4px solid #667eea;
}

.user-profile-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.profile-stat {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 5px;
}

.stat-value {
  color: #333;
  font-weight: 700;
  font-size: 1.1rem;
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

.results-header h2 {
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.similar-users-section {
  margin-bottom: 40px;
}

.similar-users-section h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.user-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.user-card:hover {
  transform: translateY(-4px);
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.user-card.top-user {
  border-left: 4px solid #ffc107;
}

.user-rank {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.user-info {
  flex: 1;
}

.user-info h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.user-info p {
  color: #666;
  margin: 4px 0;
  font-size: 0.9rem;
}

.user-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 8px;
  display: inline-block;
}

.search-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.search-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
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
  .collaborative-view {
    padding: 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .tab-nav {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1 1 50%;
    min-width: 120px;
    font-size: 0.9rem;
    padding: 14px 16px;
  }

  .user-input-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-input-group label {
    min-width: auto;
  }

  .user-input {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .users-grid {
    grid-template-columns: 1fr;
    gap: 15px;
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

  .tab-btn {
    flex: 1 1 100%;
    font-size: 0.85rem;
    padding: 12px 14px;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .user-card {
    padding: 20px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .quick-users {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
