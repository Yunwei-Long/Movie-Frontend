<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <div class="search-icon">🔍</div>
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
        <button @click="clearSearch" class="clear-btn" :disabled="isSearching">✕</button>
        <button
          @click="handleSearch"
          class="search-btn"
          :disabled="isSearching || !searchQuery.trim()"
        >
          {{ isSearching ? '🔄' : 'Search' }}
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
          <div class="poster-mini" v-if="!suggestion.poster_path">🎬</div>
          <img
            v-else
            :src="`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`"
            :alt="suggestion.title"
            class="poster-mini-img"
          />
        </div>
        <div class="suggestion-info">
          <div class="suggestion-title">{{ suggestion.title }}</div>
          <div class="suggestion-meta">
            <span v-if="suggestion.release_date">{{ getYear(suggestion.release_date) }}</span>
            <span v-if="suggestion.vote_average">⭐ {{ suggestion.vote_average.toFixed(1) }}</span>
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
      default: 'content', // 'content' or 'collaborative'
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
          // For collaborative search, we'd need to implement the API call
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
      // Delay hiding suggestions to allow click events
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

    // Watch for external changes to search query
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
    }
  },
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-icon {
  position: absolute;
  left: 20px;
  font-size: 1.2rem;
  color: #666;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.clear-btn,
.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-btn {
  color: #999;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover:not(:disabled) {
  background: #f0f0f0;
  color: #666;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-poster {
  margin-right: 12px;
  flex-shrink: 0;
}

.poster-mini,
.poster-mini-img {
  width: 40px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 0.85rem;
}

.search-filters {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  border-color: #667eea;
}

@media (max-width: 768px) {
  .search-input {
    padding: 14px 18px 14px 45px;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 16px;
    font-size: 1.1rem;
  }

  .search-suggestions {
    max-height: 250px;
  }

  .search-filters {
    flex-direction: column;
    gap: 12px;
  }

  .filter-group {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .search-input {
    padding: 12px 16px 12px 40px;
    font-size: 0.9rem;
  }

  .search-icon {
    left: 14px;
    font-size: 1rem;
  }

  .search-actions {
    margin-right: 6px;
    gap: 6px;
  }

  .clear-btn,
  .search-btn {
    padding: 6px;
    font-size: 0.8rem;
  }

  .search-btn {
    padding: 6px 12px;
  }

  .suggestion-item {
    padding: 10px 12px;
  }

  .poster-mini,
  .poster-mini-img {
    width: 32px;
    height: 48px;
    font-size: 1rem;
  }
}
</style>
