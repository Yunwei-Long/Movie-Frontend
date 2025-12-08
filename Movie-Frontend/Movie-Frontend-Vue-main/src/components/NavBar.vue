<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <div class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
          </div>
          <h1>MovieRec</h1>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <div class="nav-menu">
        <router-link to="/explore" class="nav-link" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span>Explore</span>
        </router-link>
        <router-link to="/content-based" class="nav-link" active-class="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Content-Based</span>
        </router-link>
      </div>

      <!-- Actions -->
      <div class="nav-actions">
        <button 
          @click="refreshData" 
          class="refresh-btn"
          :class="{ refreshing: isRefreshing }"
          :disabled="isRefreshing"
          title="Refresh data"
        >
          <svg 
            class="refresh-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span class="refresh-text">Refresh</span>
        </button>

        <div class="system-status" v-if="systemInfo">
          <div class="status-indicator" :class="{ active: isOnline }"></div>
          <div class="status-content">
            <span class="status-text">{{ systemInfo.total_movies?.toLocaleString() || '4,803' }}</span>
            <span class="status-label">movies</span>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMovieStore } from '@/stores/movies'

const movieStore = useMovieStore()
const systemInfo = ref(null)
const isOnline = ref(false)
const isRefreshing = ref(false)

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

const refreshData = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await Promise.all([
      movieStore.getRandomMovies(12),
      movieStore.getCollaborativeStats(),
      checkSystemStatus()
    ])
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

onMounted(() => {
  checkSystemStatus()
  setInterval(checkSystemStatus, 60000)
})
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 20px rgba(0, 77, 64, 0.12);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(38, 166, 154, 0.2);
}

.nav-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 32px;
}

/* Logo */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.brand-link:hover {
  transform: scale(1.02);
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.3);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4A5D5E 0%, #2C3E3F 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

/* Navigation Menu */
.nav-menu {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  text-decoration: none;
  color: #4A5568;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
}

.nav-link svg {
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background: rgba(153, 205, 216, 0.15);
  color: #2C3E3F;
}

.nav-link:hover svg {
  transform: scale(1.1);
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.25) 0%, rgba(184, 213, 198, 0.25) 100%);
  color: #2C3E3F;
  box-shadow: 0 2px 8px rgba(153, 205, 216, 0.2);
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.refresh-btn {
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.2) 0%, rgba(184, 213, 198, 0.2) 100%);
  color: #4A5D5E;
  border: 2px solid rgba(153, 205, 216, 0.3);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-icon {
  transition: transform 0.6s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(153, 205, 216, 0.3) 0%, rgba(184, 213, 198, 0.3) 100%);
  border-color: #99CDD8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.25);
}

.refresh-btn:hover:not(:disabled) .refresh-icon {
  transform: rotate(180deg);
}

.refresh-btn.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* System Status */
.system-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(232, 244, 240, 0.6) 0%, rgba(245, 237, 228, 0.6) 100%);
  border-radius: 12px;
  border: 2px solid rgba(184, 213, 198, 0.3);
  transition: all 0.3s ease;
}

.system-status:hover {
  box-shadow: 0 2px 8px rgba(153, 205, 216, 0.2);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #E87461;
  position: relative;
  flex-shrink: 0;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.active {
  background: #68D391;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.8);
  }
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-text {
  font-weight: 700;
  font-size: 1rem;
  color: #2C3E3F;
  line-height: 1;
}

.status-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 28px;
    gap: 24px;
  }

  .nav-menu {
    gap: 6px;
  }

  .nav-link {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
    height: 64px;
    gap: 16px;
  }

  .logo-icon {
    width: 38px;
    height: 38px;
  }

  .logo-icon svg {
    width: 24px;
    height: 24px;
  }

  .nav-brand h1 {
    font-size: 1.5rem;
  }

  .nav-menu {
    gap: 4px;
  }

  .nav-link {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .nav-link span {
    display: none;
  }

  .nav-link svg {
    width: 20px;
    height: 20px;
  }

  .refresh-btn {
    padding: 8px 14px;
  }

  .refresh-text {
    display: none;
  }

  .system-status {
    padding: 8px 12px;
  }

  .status-text {
    font-size: 0.9rem;
  }

  .status-label {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 16px;
    height: 60px;
    gap: 12px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .nav-brand h1 {
    font-size: 1.3rem;
  }

  .nav-menu {
    flex: 0;
  }

  .refresh-btn {
    padding: 8px;
    min-width: 40px;
  }

  .system-status {
    padding: 8px;
  }

  .status-content {
    display: none;
  }
}
</style>