<script setup>
import { useRouter } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'

const router = useRouter()

const handleMovieClick = (movie) => {
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleSearch = () => {
  router.push('/explore')
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">MovieRec</h1>
        <p class="hero-subtitle">
          Discover movies using content-based and collaborative filtering algorithms
        </p>

        <div class="hero-search">
          <SearchBar
            placeholder="Search for movies..."
            :auto-search="true"
            @search="handleSearch"
            @select="handleMovieClick"
          />
        </div>
      </div>
    </section>

    <!-- Navigation Section -->
    <section class="nav-section">
      <div class="container">
        <h2 class="section-title">Get Started</h2>
        <div class="nav-grid">
          <button @click="router.push('/explore')" class="nav-card">
            <div class="card-content">
              <div class="card-left">
                <div class="nav-icon search-icon"></div>
              </div>
              <div class="card-right">
                <h3>Explore Movies</h3>
                <p>Browse random movies and discover detailed statistics</p>
              </div>
            </div>
          </button>

          <button @click="router.push('/content-based')" class="nav-card">
            <div class="card-content">
              <div class="card-left">
                <div class="nav-icon content-icon"></div>
              </div>
              <div class="card-right">
                <h3>Content-Based</h3>
                <p>Get recommendations based on movie genres, themes, and features</p>
              </div>
            </div>
          </button>

          <button @click="router.push('/collaborative')" class="nav-card">
            <div class="card-content">
              <div class="card-left">
                <div class="nav-icon collaborative-icon"></div>
              </div>
              <div class="card-right">
                <h3>Collaborative Filtering</h3>
                <p>Discover movies based on similar user preferences</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  padding: 100px 20px 80px;
  text-align: center;
  color: #657166;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  color: #333;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 50px;
  opacity: 0.9;
  line-height: 1.6;
  color: #657166;
}

.hero-search {
  margin-bottom: 0;
}

.nav-section {
  padding: 80px 20px;
  background: rgba(218, 235, 227, 0.3);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 50px;
}

.nav-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-card {
  background: white;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  text-align: left;
  overflow: hidden;
}

.nav-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.25);
  border-color: #99CDD8;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 32px;
  gap: 24px;
}

.card-left {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 12px;
}

/* 导航图标样式 - 替换表情符号 */
.nav-icon {
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.search-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
}

.content-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E");
}

.collaborative-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E");
}

.card-right {
  flex: 1;
}

.nav-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}

.nav-card p {
  color: #657166;
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 15px 60px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }

  .nav-section {
    padding: 60px 15px;
  }

  .section-title {
    font-size: 1.8rem;
    margin-bottom: 40px;
  }

  .nav-grid {
    gap: 20px;
  }

  .card-content {
    padding: 24px;
    gap: 20px;
  }

  .card-left {
    width: 70px;
    height: 70px;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-card h3 {
    font-size: 1.3rem;
  }

  .nav-card p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .card-content {
    padding: 20px;
    gap: 16px;
  }

  .card-left {
    width: 60px;
    height: 60px;
    border-radius: 10px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }

  .nav-card h3 {
    font-size: 1.2rem;
  }

  .nav-card p {
    font-size: 0.9rem;
  }
}
</style>