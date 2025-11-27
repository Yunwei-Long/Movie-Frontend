<script setup>
import { useRouter } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'

const router = useRouter()

const handleMovieClick = (movie) => {
  router.push(`/movie/${encodeURIComponent(movie.title)}`)
}

const handleSearch = () => {
  // Navigate to explore page
  router.push('/explore')
}
</script>

<template>
  <div class="home-view">
    <!-- Simple Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Movie Recommendation System</h1>
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
        <div class="nav-grid">
          <button @click="router.push('/content-based')" class="nav-card">
            <div class="nav-icon">🎭</div>
            <h3>Content-Based</h3>
            <p>Recommendations based on movie content</p>
          </button>

          <button @click="router.push('/collaborative')" class="nav-card">
            <div class="nav-icon">👥</div>
            <h3>Collaborative</h3>
            <p>User-based recommendations</p>
          </button>

          <button @click="router.push('/explore')" class="nav-card">
            <div class="nav-icon">🔍</div>
            <h3>Explore</h3>
            <p>Browse random movies and statistics</p>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 50px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-search {
  margin-bottom: 0;
}

.nav-section {
  padding: 60px 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.nav-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.nav-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.nav-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: block;
}

.nav-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.nav-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 15px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 40px;
  }

  .nav-section {
    padding: 40px 15px;
  }

  .nav-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .nav-card {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .nav-icon {
    font-size: 2.5rem;
  }

  .nav-card h3 {
    font-size: 1.3rem;
  }
}
</style>
