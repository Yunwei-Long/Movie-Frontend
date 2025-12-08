<template>
  <div class="movie-card" @click="handleClick">
    <div class="movie-poster">
      <div class="poster-placeholder" v-if="!standardizedMovie.poster_path">
        <div class="poster-icon"></div>
      </div>
      <img
        v-else
        :src="`https://image.tmdb.org/t/p/w500${standardizedMovie.poster_path}`"
        :alt="standardizedMovie.title"
        class="poster-image"
        @error="handleImageError"
      />
      <div class="movie-rating" v-if="standardizedMovie.vote_average || standardizedMovie.rating">
        <span class="rating-star"></span>
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
          <span class="metadata-icon"></span>
          <span>{{ standardizedMovie.runtime }}min</span>
        </div>
        <div class="metadata-item" v-if="standardizedMovie.vote_count">
          <span class="metadata-icon"></span>
          <span>{{ formatNumber(standardizedMovie.vote_count) }} votes</span>
        </div>
        <div class="metadata-item" v-if="standardizedMovie.popularity">
          <span class="metadata-icon"></span>
          <span>{{ standardizedMovie.popularity.toFixed(1) }}</span>
        </div>
      </div>

      <div class="movie-actions">
        <button class="action-btn primary" @click.stop="handleRecommend" :disabled="isLoading">
          <span class="btn-icon"></span>
          Get Recommendations
        </button>
        <button class="action-btn secondary" @click.stop="handleDetails">
          <span class="btn-icon"></span>
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
/* 基础卡片样式优化 */
.movie-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-height: 620px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

/* 海报区域优化 */
.movie-poster {
  position: relative;
  width: 100%;
  height: 380px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f8f7 0%, #eaf2ef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eaf2ef 0%, #f5f8f7 100%);
  position: relative;
}

.poster-placeholder::after {
  content: '';
  width: 60px;
  height: 60px;
  border: 3px solid #ccd8d3;
  border-radius: 8px;
  position: relative;
}

.poster-placeholder::before {
  content: '';
  width: 30px;
  height: 30px;
  border-left: 3px solid #99cdd8;
  border-bottom: 3px solid #99cdd8;
  position: absolute;
  bottom: 40%;
  right: 40%;
  transform: rotate(-45deg);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.movie-card:hover .poster-image {
  transform: scale(1.03);
}

/* 评分样式优化 */
.movie-rating {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(68, 77, 69, 0.9);
  color: white;
  padding: 8px 14px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.rating-star {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 信息区域样式优化 */
.movie-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d332e;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.movie-card:hover .movie-title {
  color: #4a6c60;
}

.movie-year {
  margin: 0 0 16px 0;
  color: #657166;
  font-size: 0.95rem;
  font-weight: 500;
}

/* 类型标签优化 */
.movie-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 26px;
}

.genre-tag {
  background: linear-gradient(135deg, #e8f0ee 0%, #d4e2dc 100%);
  color: #3a443d;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.78rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.genre-tag:hover {
  background: linear-gradient(135deg, #d4e2dc 0%, #c0d6ce 100%);
  transform: translateY(-1px);
}

/* 概述文本优化 */
.movie-overview {
  margin: 0 0 20px 0;
  color: #4a554e;
  font-size: 0.95rem;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.2em;
}

/* 元数据样式优化 */
.movie-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #657166;
  font-size: 0.88rem;
  white-space: nowrap;
}

.metadata-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

/* 运行时间图标 */
.metadata-item:nth-child(1) .metadata-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 投票数图标 */
.metadata-item:nth-child(2) .metadata-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 热度图标 */
.metadata-item:nth-child(3) .metadata-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23657166'%3E%3Cpath d='M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.87-3.41 4.53-.2.06-.38.06-.58 0C9.16 10.31 7.8 8.5 7.8 6.46c0-2.15.74-4.8 2.74-4.8C11.43.28 13.5.67 13.5.67M14.25 13c0 3-2.54 5.1-5.25 5.1S3.75 16 3.75 13H14.25m-3.54 6.92l-.71.71L9.43 21l-1.41-1.41l-.71.71l1.41 1.41L7 24l1.41-1.41l.71.71l1.42-1.42l.71.71L12.41 24l1.42-1.41l-.71-.71l1.42-1.42l-.71-.71l-1.42 1.42l-.71-.71l-1.42 1.42z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 按钮区域优化 */
.movie-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 44px;
}

/* 主按钮样式 */
.action-btn.primary {
  background: linear-gradient(135deg, #99cdd8 0%, #82b8c4 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(153, 205, 216, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 205, 216, 0.4);
  background: linear-gradient(135deg, #82b8c4 0%, #6ba8b6 100%);
}

.action-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 次要按钮样式 */
.action-btn.secondary {
  background: #ffffff;
  color: #4a6c60;
  border: 1px solid #d4e2dc;
}

.action-btn.secondary:hover {
  background: #f5f8f7;
  border-color: #99cdd8;
  color: #3a564e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 按钮图标 */
.btn-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
}

/* 推荐按钮图标 */
.action-btn.primary .btn-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 详情按钮图标 */
.action-btn.secondary .btn-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a6c60'%3E%3Cpath d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .movie-poster {
    height: 320px;
  }

  .movie-info {
    padding: 20px;
  }

  .movie-title {
    font-size: 1.2rem;
  }

  .movie-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .movie-poster {
    height: 280px;
  }

  .movie-info {
    padding: 16px;
  }

  .movie-title {
    font-size: 1.1rem;
  }

  .genre-tag {
    font-size: 0.72rem;
    padding: 4px 8px;
  }

  .movie-metadata {
    gap: 12px;
  }

  .metadata-item {
    font-size: 0.82rem;
  }
}

@media (max-width: 360px) {
  .movie-poster {
    height: 240px;
  }

  .movie-card {
    min-height: 580px;
  }
}
</style>