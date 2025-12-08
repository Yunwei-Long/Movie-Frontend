<template>
  <div class="about">
    <div class="container">
      <section class="header-section">
        <div class="header-content">
          <h1 class="page-title">📖 About MovieRec</h1>
          <p class="page-description">
            Learn more about our movie recommendation system and the technology behind it
          </p>
        </div>
      </section>

      <section class="info-section">
        <div class="info-content">
          <h2>🎬 Our Mission</h2>
          <p>
            MovieRec is designed to help you discover movies you'll love using advanced machine learning algorithms.
            We combine content-based and collaborative filtering to provide personalized recommendations.
          </p>
        </div>
      </section>

      <section class="features-section">
        <h2 class="section-title">✨ Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎭</div>
            <h3>Content-Based Filtering</h3>
            <p>Find movies similar to ones you love based on genres, keywords, cast, and more.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Collaborative Filtering</h3>
            <p>Get recommendations based on users with similar taste patterns.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Advanced Search</h3>
            <p>Explore our extensive database with powerful search capabilities.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Rich Analytics</h3>
            <p>Access detailed statistics and insights about movies and users.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 50px 30px;
  background: linear-gradient(135deg, #99CDD8 0%, #DAEBE3 100%);
  border-radius: 16px;
  color: #657166;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.info-section {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
  margin-bottom: 40px;
}

.info-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #657166;
  margin-bottom: 20px;
}

.info-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #657166;
}

.features-section {
  background: white;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(153, 205, 216, 0.2);
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #657166;
  margin-bottom: 30px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.feature-card {
  background: #DAEBE3;
  padding: 30px 25px;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid #99CDD8;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(153, 205, 216, 0.25);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #657166;
  margin-bottom: 15px;
}

.feature-card p {
  color: #657166;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .about {
    padding: 15px;
  }

  .header-section {
    padding: 40px 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .info-section,
  .features-section {
    padding: 30px 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>