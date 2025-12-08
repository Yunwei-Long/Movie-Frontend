<script setup>
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useMovieStore } from './stores/movies'

const movieStore = useMovieStore()
const isGlobalLoading = ref(false)
const showError = ref(!!movieStore.error)

watch(
  () => movieStore.error,
  (newError) => {
    showError.value = !!newError
    if (newError) {
      const timer = setTimeout(() => {
        if (showError.value) movieStore.clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  },
  { immediate: true }
)

const closeError = () => {
  showError.value = false
  setTimeout(() => {
    movieStore.clearError()
  }, 300)
}
</script>

<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <!-- 优化后的醒目错误提示（无左侧竖线） -->
      <transition name="slide-fade">
        <div v-if="showError" class="error-banner">
          <div class="error-content">
            <div class="error-icon">!</div>
            <div class="error-text">
              <h4 class="error-title">Error</h4>
              <p class="error-message">{{ movieStore.error }}</p>
            </div>
            <button @click="closeError" class="error-close" aria-label="Close error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="movieStore.isLoading && isGlobalLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <p class="loading-text">Loading content...</p>
          </div>
        </div>
      </transition>

      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-main">
          <h3 class="footer-brand">MovieRec</h3>
          <p class="footer-description">Intelligent Movie Recommendation System</p>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-info">
          <p class="footer-tech">Built with Vue 3 · Flask · Machine Learning</p>
          <p class="footer-copyright">© 2026 MovieRec. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* 基础样式重置 */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #E8F4F0 0%, #FFF5EB 100%);
  min-height: 100vh;
  color: #2C3E3F;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 内容区 */
.main-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 醒目错误提示（无左侧竖线） */
.error-banner {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 560px;
  width: 90%;
}

.error-content {
  background: linear-gradient(135deg, #FFF6F6 0%, #FFEEEE 100%);
  padding: 24px 28px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 12px 40px rgba(232, 116, 97, 0.2),
              0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid #F5D6D0;
}

/* 醒目错误图标 */
.error-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #E87461 0%, #F29586 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(232, 116, 97, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.error-text {
  flex: 1;
}

.error-title {
  font-size: 1rem;
  font-weight: 700;
  color: #E87461;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.error-message {
  font-size: 1rem;
  color: #4A5568;
  line-height: 1.5;
  word-break: break-word;
  font-weight: 500;
}

/* 关闭按钮增强 */
.error-close {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #F5D6D0;
  color: #E87461;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(232, 116, 97, 0.2);
}

.error-close:active {
  transform: scale(0.95);
}

/* 加载遮罩样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-content {
  background: white;
  padding: 48px 56px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(153, 205, 216, 0.15),
              0 8px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid #DAEBE3;
}

.loading-spinner {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #99CDD8;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: #B8D5C6;
  animation-duration: 2s;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: #E8C4A8;
  animation-duration: 2.5s;
}

.loading-text {
  color: #657166;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

/* 页脚样式 */
.app-footer {
  background: linear-gradient(135deg, #4A5D5E 0%, #2C3E3F 100%);
  color: white;
  padding: 48px 40px 32px;
  margin-top: auto;
  width: 100%;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-main {
  text-align: center;
  margin-bottom: 24px;
}

.footer-brand {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #99CDD8 0%, #B8D5C6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.footer-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  margin: 24px 0;
}

.footer-info {
  text-align: center;
}

.footer-tech {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 400;
}

.footer-copyright {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
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

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .main-content {
    padding: 28px 32px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 20px;
  }

  .error-banner {
    top: 80px;
    width: 92%;
  }

  .error-content {
    padding: 20px 24px;
    gap: 12px;
  }

  .error-icon {
    width: 36px;
    height: 36px;
    font-size: 1.3rem;
  }

  .error-title {
    font-size: 0.9rem;
  }

  .error-message {
    font-size: 0.95rem;
  }

  .error-close {
    width: 32px;
    height: 32px;
  }

  .loading-content {
    padding: 36px 40px;
    margin: 0 20px;
  }

  .loading-spinner {
    width: 52px;
    height: 52px;
  }

  .loading-text {
    font-size: 0.9rem;
  }

  .app-footer {
    padding: 36px 24px 24px;
  }

  .footer-brand {
    font-size: 1.5rem;
  }

  .footer-description {
    font-size: 0.875rem;
  }

  .footer-tech {
    font-size: 0.8rem;
  }

  .footer-copyright {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px 16px;
  }

  .error-banner {
    width: 94%;
    top: 70px;
  }

  .error-content {
    padding: 16px 20px;
    gap: 10px;
  }

  .error-icon {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }

  .error-title {
    font-size: 0.85rem;
  }

  .error-message {
    font-size: 0.9rem;
  }

  .error-close {
    width: 28px;
    height: 28px;
  }

  .loading-content {
    padding: 28px 32px;
    margin: 0 16px;
  }

  .loading-spinner {
    width: 44px;
    height: 44px;
  }

  .loading-text {
    font-size: 0.85rem;
  }

  .app-footer {
    padding: 28px 20px 20px;
  }

  .footer-brand {
    font-size: 1.3rem;
  }

  .footer-description {
    font-size: 0.825rem;
  }

  .footer-divider {
    margin: 20px 0;
  }

  .footer-tech {
    font-size: 0.75rem;
  }

  .footer-copyright {
    font-size: 0.7rem;
  }
}
</style>