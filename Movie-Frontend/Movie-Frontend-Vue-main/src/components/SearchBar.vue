<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <div class="search-icon"></div>
      <input
        ref="searchInput"
        v-model="searchQuery"
        @input="handleInput"
        @keyup.enter="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        :disabled="isSearching"
      />
      <div class="search-actions" v-if="searchQuery">
        <button @click="clearSearch" class="clear-btn" :disabled="isSearching"></button>
        <button
          @click="handleSearch"
          class="search-btn"
          :disabled="isSearching || !searchQuery.trim()"
        >
          <span v-if="isSearching" class="loading-spinner"></span>
          <span v-else>Search</span>
        </button>
      </div>
    </div>

    <div class="search-suggestions" v-if="showSuggestions && suggestions.length > 0">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id || suggestion.title"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        <div class="suggestion-poster">
          <div class="poster-mini" v-if="!suggestion.poster_path"></div>
          <img
            v-else
            :src="`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`"
            :alt="suggestion.title"
            class="poster-mini-img"
            @error="handleImageError"
          />
        </div>
        <div class="suggestion-info">
          <div class="suggestion-title">{{ suggestion.title }}</div>
          <div class="suggestion-meta">
            <span v-if="suggestion.release_date">{{ getYear(suggestion.release_date) }}</span>
            <span v-if="suggestion.vote_average" class="rating">
              <span class="rating-icon"></span>
              {{ suggestion.vote_average.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="search-filters" v-if="showFilters">
      <div class="filter-group">
        <label class="filter-label">Limit Results:</label>
        <select v-model="resultLimit" class="filter-select">
          <option value="5">5 results</option>
          <option value="10">10 results</option>
          <option value="12">12 results</option>
          <option value="20">20 results</option>
          <option value="50">50 results</option>
        </select>
      </div>

      <div class="filter-group" v-if="searchType === 'content'">
        <label class="filter-label">Similarity Type:</label>
        <select v-model="similarityType" class="filter-select">
          <option value="tags">Tags</option>
          <option value="genres">Genres</option>
          <option value="keywords">Keywords</option>
          <option value="cast">Cast</option>
          <option value="production">Production</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useMovieStore } from '@/stores/movies'

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Search for movies...',
    },
    searchType: {
      type: String,
      default: 'content',
      validator: (value) => ['content', 'collaborative'].includes(value),
    },
    showFilters: {
      type: Boolean,
      default: false,
    },
    autoSearch: {
      type: Boolean,
      default: false,
    },
    debounceDelay: {
      type: Number,
      default: 300,
    },
  },
  emits: ['search', 'select', 'clear'],
  setup(props, { emit }) {
    const movieStore = useMovieStore()
    const searchInput = ref(null)
    const searchQuery = ref('')
    const suggestions = ref([])
    const showSuggestions = ref(false)
    const resultLimit = ref(12)
    const similarityType = ref('tags')
    const isSearching = ref(false)

    let debounceTimer = null

    const handleInput = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      if (searchQuery.value.trim()) {
        debounceTimer = setTimeout(() => {
          if (props.autoSearch) {
            handleSearch()
          } else {
            getSuggestions()
          }
        }, props.debounceDelay)
      } else {
        suggestions.value = []
        showSuggestions.value = false
      }
    }

    const getSuggestions = async () => {
      if (!searchQuery.value.trim()) return

      try {
        const query = searchQuery.value.trim()
        let results

        if (props.searchType === 'content') {
          const response = await movieStore.searchMovies(query, 5)
          results = response
        } else {
          const response = await movieStore.searchMovies(query, 5)
          results = response
        }

        suggestions.value = results.slice(0, 5)
        showSuggestions.value = true
      } catch (error) {
        console.error('Failed to get suggestions:', error)
        suggestions.value = []
      }
    }

    const handleSearch = async () => {
      const query = searchQuery.value.trim()
      if (!query) return

      try {
        isSearching.value = true
        showSuggestions.value = false

        let results
        if (props.searchType === 'content') {
          results = await movieStore.searchMovies(query, parseInt(resultLimit.value))
        } else {
          results = await movieStore.searchMovies(query, parseInt(resultLimit.value))
        }

        emit('search', {
          query,
          results,
          type: props.searchType,
          limit: resultLimit.value,
          similarityType: similarityType.value,
        })
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        isSearching.value = false
      }
    }

    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion.title
      showSuggestions.value = false
      emit('select', suggestion)

      if (props.autoSearch) {
        nextTick(() => {
          handleSearch()
        })
      }
    }

    const clearSearch = () => {
      searchQuery.value = ''
      suggestions.value = []
      showSuggestions.value = false
      emit('clear')
    }

    const handleFocus = () => {
      if (suggestions.value.length > 0) {
        showSuggestions.value = true
      }
    }

    const handleBlur = () => {
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    const getYear = (dateString) => {
      return new Date(dateString).getFullYear()
    }

    const focus = () => {
      searchInput.value?.focus()
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
      event.target.parentElement.querySelector('.poster-mini')?.classList.add('show-placeholder')
    }

    watch(searchQuery, (newValue) => {
      if (!newValue) {
        suggestions.value = []
        showSuggestions.value = false
      }
    })

    return {
      searchInput,
      searchQuery,
      suggestions,
      showSuggestions,
      resultLimit,
      similarityType,
      isSearching,
      handleInput,
      handleSearch,
      selectSuggestion,
      clearSearch,
      handleFocus,
      handleBlur,
      getYear,
      focus,
      handleImageError,
    }
  },
}
</script>

<style scoped>
/* 搜索容器基础样式 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

/* 搜索输入框容器 */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.search-input-wrapper:focus-within {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  border-color: rgba(153, 205, 216, 0.2);
}

/* 搜索图标 */
.search-icon {
  position: absolute;
  left: 20px;
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  z-index: 2;
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  padding: 16px 20px 16px 56px;
  border: none;
  border-radius: 32px;
  font-size: 1rem;
  outline: none;
  background: transparent;
  color: #2d332e;
  font-weight: 500;
}

.search-input::placeholder {
  color: #949e96;
  font-weight: 400;
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 搜索操作按钮组 */
.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
}

.clear-btn,
.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 清除按钮 */
.clear-btn {
  width: 36px;
  height: 36px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23949e96'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E") no-repeat center;
  background-size: 18px;
}

.clear-btn:hover:not(:disabled) {
  background-color: #f0f5f3;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E");
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 搜索按钮 */
.search-btn {
  background: linear-gradient(135deg, #99cdd8 0%, #82b8c4 100%);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 24px;
  font-weight: 600;
  width: auto;
  height: 36px;
  box-shadow: 0 2px 8px rgba(153, 205, 216, 0.3);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.4);
  background: linear-gradient(135deg, #82b8c4 0%, #6ba8b6 100%);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 搜索建议列表 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  margin-top: 12px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: slideDown 0.2s ease-out;
}

/* 建议项 */
.suggestion-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f8faf9;
  padding-left: 24px;
}

/* 建议项海报 */
.suggestion-poster {
  margin-right: 16px;
  flex-shrink: 0;
  position: relative;
}

.poster-mini,
.poster-mini-img {
  width: 48px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: linear-gradient(135deg, #f0f5f3 0%, #eaf2ef 100%);
  overflow: hidden;
}

.poster-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.poster-mini::after {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #ccd8d3;
  border-radius: 4px;
  position: relative;
}

.poster-mini::before {
  content: '';
  width: 10px;
  height: 10px;
  border-left: 2px solid #99cdd8;
  border-bottom: 2px solid #99cdd8;
  position: absolute;
  bottom: 38%;
  right: 38%;
  transform: rotate(-45deg);
}

.poster-mini.show-placeholder {
  display: flex !important;
}

/* 建议项信息 */
.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #2d332e;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.suggestion-meta {
  display: flex;
  gap: 16px;
  color: #657166;
  font-size: 0.85rem;
  align-items: center;
}

/* 评分样式 */
.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 搜索过滤器 */
.search-filters {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding: 18px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 200px;
}

.filter-label {
  color: #2d332e;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  padding-right: 32px;
  border: 1px solid #e0e6e3;
  border-radius: 8px;
  background: white;
  color: #2d332e;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23657166' viewBox='0 0 16 16'%3E%3Cpath d='M8 11l4-4H4l4 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  flex: 1;
  min-width: 120px;
}

.filter-select:focus {
  border-color: #99cdd8;
  box-shadow: 0 0 0 3px rgba(153, 205, 216, 0.15);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .search-input {
    padding: 14px 18px 14px 52px;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 18px;
    width: 18px;
    height: 18px;
  }

  .search-suggestions {
    max-height: 280px;
    margin-top: 10px;
  }

  .search-filters {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .filter-group {
    justify-content: space-between;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-input {
    padding: 12px 16px 12px 48px;
    font-size: 0.9rem;
  }

  .search-icon {
    left: 16px;
    width: 16px;
    height: 16px;
  }

  .search-actions {
    margin-right: 8px;
    gap: 6px;
  }

  .clear-btn {
    width: 32px;
    height: 32px;
    background-size: 16px;
  }

  .search-btn {
    padding: 6px 16px;
    font-size: 0.85rem;
    height: 32px;
  }

  .suggestion-item {
    padding: 12px 16px;
  }

  .poster-mini,
  .poster-mini-img {
    width: 40px;
    height: 60px;
  }

  .suggestion-title {
    font-size: 0.9rem;
  }

  .suggestion-meta {
    font-size: 0.8rem;
    gap: 12px;
  }
}

/* 动画关键帧 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式优化 */
.search-suggestions::-webkit-scrollbar {
  width: 6px;
}

.search-suggestions::-webkit-scrollbar-track {
  background: #f8faf9;
  border-radius: 3px;
}

.search-suggestions::-webkit-scrollbar-thumb {
  background: #ccd8d3;
  border-radius: 3px;
}

.search-suggestions::-webkit-scrollbar-thumb:hover {
  background: #99cdd8;
}
</style>