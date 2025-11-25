<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <h1>🎬 MovieRec</h1>
        </router-link>
      </div>

      <div class="nav-menu">
        <router-link to="/explore" class="nav-link" active-class="active">
          <span class="nav-icon">🔍</span>
          Explore
        </router-link>
        <router-link to="/content-based" class="nav-link" active-class="active">
          <span class="nav-icon">🎭</span>
          Content-Based
        </router-link>
      </div>

      <div class="nav-actions">
        <div class="system-status" v-if="systemInfo">
          <span class="status-indicator" :class="{ active: isOnline }"></span>
          <span class="status-text">{{ systemInfo.total_movies }} movies</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useMovieStore } from '@/stores/movies'

export default {
  name: 'NavBar',
  setup() {
    const movieStore = useMovieStore()
    const systemInfo = ref(null)
    const isOnline = ref(false)

    const checkSystemStatus = async () => {
      try {
        const info = await movieStore.fetchSystemInfo()
        systemInfo.value = info
        isOnline.value = true
      } catch (error) {
        console.error('Failed to fetch system info:', error)
        isOnline.value = false
      }
    }

    onMounted(() => {
      checkSystemStatus()
      // Check status every 30 seconds
      setInterval(checkSystemStatus, 30000)
    })

    return {
      systemInfo,
      isOnline,
    }
  },
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand .brand-link {
  text-decoration: none;
  color: white;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff4444;
  animation: pulse 2s infinite;
}

.status-indicator.active {
  background-color: #44ff44;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.status-text {
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    height: 60px;
  }

  .nav-brand h1 {
    font-size: 1.5rem;
  }

  .nav-menu {
    gap: 5px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .nav-icon {
    font-size: 1rem;
  }

  .system-status {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .status-text span {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: none;
  }

  .system-status .status-text {
    display: none;
  }
}
</style>
