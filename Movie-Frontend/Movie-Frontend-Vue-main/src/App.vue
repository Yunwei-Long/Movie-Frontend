<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useMovieStore } from './stores/movies'

const movieStore = useMovieStore()
const isGlobalLoading = ref(false) // Disable global loading overlay for better UX
</script>

<template>
  <div id="app">
    <NavBar />

    <main class="main-content">
      <!-- Error Display -->
      <div v-if="movieStore.error" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span class="error-message">{{ movieStore.error }}</span>
          <button @click="movieStore.clearError()" class="error-close">×</button>
        </div>
      </div>

      <!-- Loading Overlay - only for critical operations -->
      <div v-if="movieStore.isLoading && isGlobalLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>

      <!-- Router View -->
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 MovieRec - Movie Recommendation System</p>
        <p>Powered by Vue 3, Flask, and Machine Learning</p>
      </div>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 20px;
}

.error-banner {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 600px;
  width: 90%;
}

.error-content {
  background: #ff4757;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(255, 71, 87, 0.3);
  animation: slideDown 0.3s ease;
}

.error-icon {
  font-size: 1.2rem;
}

.error-message {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.error-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-content p {
  color: #666;
  font-weight: 500;
}

.app-footer {
  background: #2c3e50;
  color: white;
  padding: 24px 20px;
  text-align: center;
  margin-top: auto;
}

.footer-content p {
  margin: 4px 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.footer-content p:first-child {
  font-weight: 600;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding-top: 10px;
  }

  .error-banner {
    top: 70px;
    width: 95%;
  }

  .error-content {
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .loading-content {
    padding: 24px;
    margin: 0 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
  }

  .app-footer {
    padding: 20px 16px;
  }

  .footer-content p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .error-banner {
    width: 90%;
    top: 60px;
  }

  .error-content {
    padding: 10px 14px;
    font-size: 0.85rem;
    gap: 8px;
  }

  .loading-content {
    padding: 20px;
    margin: 0 12px;
  }

  .footer-content p {
    font-size: 0.8rem;
  }
}
</style>
