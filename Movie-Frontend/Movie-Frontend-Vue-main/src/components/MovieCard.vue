<template>
  <div class="movie-card" @click="handleClick">
    <div class="movie-poster">
      <div class="poster-placeholder" v-if="!standardizedMovie.poster_path">
        <div class="poster-icon">🎬</div>
      </div>
      <img
        v-else
        :src="`https://image.tmdb.org/t/p/w500${standardizedMovie.poster_path}`"
        :alt="standardizedMovie.title"
        class="poster-image"
        @error="handleImageError"
      />
      <div class="movie-rating" v-if="standardizedMovie.vote_average || standardizedMovie.rating">
        <span class="rating-star">⭐</span>
        <span class="rating-score">{{
          (standardizedMovie.vote_average || standardizedMovie.rating).toFixed(1)
        }}</span>
      </div>
    </div>

    <div class="movie-info">
      <h3 class="movie-title">{{ standardizedMovie.title }}</h3>
      <p class="movie-year" v-if="standardizedMovie.release_date || standardizedMovie.year">
        {{ new Date(standardizedMovie.release_date || standardizedMovie.year).getFullYear() }}
      </p>

      <div
        class="movie-genres"
        v-if="standardizedMovie.genres && standardizedMovie.genres.length > 0"
      >
        <span
          v-for="genre in standardizedMovie.genres.slice(0, 3)"
          :key="genre.id || genre"
          class="genre-tag"
        >
          {{ genre.name || genre }}
        </span>
      </div>

      <p class="movie-overview" v-if="standardizedMovie.overview">
        {{ truncateText(standardizedMovie.overview, 120) }}
      </p>

      <div class="movie-metadata" v-if="showMetadata">
        <div class="metadata-item" v-if="standardizedMovie.runtime">
          <span class="metadata-icon">⏱️</span>
          <span>{{ standardizedMovie.runtime }}min</span>
        </div>
        <div class="metadata-item" v-if="standardizedMovie.vote_count">
          <span class="metadata-icon">👥</span>
          <span>{{ formatNumber(standardizedMovie.vote_count) }} votes</span>
        </div>
        <div class="metadata-item" v-if="standardizedMovie.popularity">
          <span class="metadata-icon">🔥</span>
          <span>{{ standardizedMovie.popularity.toFixed(1) }}</span>
        </div>
      </div>

      <div class="movie-actions">
        <button class="action-btn primary" @click.stop="handleRecommend" :disabled="isLoading">
          <span class="btn-icon">🎯</span>
          Get Recommendations
        </button>
        <button class="action-btn secondary" @click.stop="handleDetails">
          <span class="btn-icon">ℹ️</span>
          Details
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movies'

export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true,
    },
    showMetadata: {
      type: Boolean,
      default: true,
    },
    clickable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter()
    const movieStore = useMovieStore()

    const isLoading = computed(() => movieStore.isLoading)

    // Standardize movie data format
    const standardizedMovie = computed(() => {
      const title = props.movie.title || props.movie.name || 'Unknown Title'
      console.log('MovieCard standardizedMovie - props.movie:', props.movie)
      console.log('MovieCard standardizedMovie - title:', title)

      return {
        id: props.movie.id || props.movie.movie_id,
        title: title,
        poster_path: props.movie.poster_path,
        vote_average: props.movie.vote_average,
        rating: props.movie.rating,
        release_date: props.movie.release_date,
        year: props.movie.year,
        overview: props.movie.overview,
        runtime: props.movie.runtime,
        vote_count: props.movie.vote_count,
        popularity: props.movie.popularity,
        genres: props.movie.genres || [],
      }
    })

    const handleClick = () => {
      if (props.clickable) {
        console.log('MovieCard click - props.movie:', props.movie)
        console.log('MovieCard click - standardizedMovie:', standardizedMovie.value)
        emit('click', standardizedMovie.value)
      }
    }

    const handleRecommend = async () => {
      try {
        await movieStore.getContentRecommendations(standardizedMovie.value.title)
        router.push('/content-based')
      } catch (error) {
        console.error('Failed to get recommendations:', error)
      }
    }

    const handleDetails = async () => {
      try {
        await movieStore.getMovieDetails(standardizedMovie.value.title)
        emit('show-details', standardizedMovie.value)
      } catch (error) {
        console.error('Failed to get movie details:', error)
      }
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
      event.target.nextElementSibling?.classList.add('show-placeholder')
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const formatNumber = (num) => {
      if (!num) return '0'
      return new Intl.NumberFormat().format(Math.round(num))
    }

    return {
      isLoading,
      standardizedMovie,
      handleClick,
      handleRecommend,
      handleDetails,
      handleImageError,
      truncateText,
      formatNumber,
    }
  },
}
</script>

<style scoped>
.movie-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 600px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.poster-icon {
  font-size: 4rem;
  opacity: 0.8;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster-image {
  transform: scale(1.05);
}

.movie-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.rating-star {
  font-size: 1rem;
}

.movie-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-year {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.movie-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  min-height: 24px;
}

.genre-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.movie-overview {
  margin: 0 0 16px 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3em;
}

.movie-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.85rem;
}

.metadata-icon {
  font-size: 0.9rem;
}

.movie-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 15px;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 40px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.action-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.action-btn.secondary:hover {
  background: #e9ecef;
  color: #333;
}

.btn-icon {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .movie-poster {
    height: 250px;
  }

  .movie-info {
    padding: 16px;
  }

  .movie-title {
    font-size: 1.1rem;
  }

  .movie-actions {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .movie-poster {
    height: 200px;
  }

  .movie-info {
    padding: 12px;
  }

  .movie-title {
    font-size: 1rem;
  }

  .genre-tag {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>
