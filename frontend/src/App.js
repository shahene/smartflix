import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Home Page Component
function HomePage() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/movies?page=${currentPage}&limit=50`);
      const data = await res.json();
      
      if (currentPage === 1) {
        setMovies(data.movies);
      } else {
        setMovies(prev => [...prev, ...data.movies]);
      }
      
      setHasMore(data.movies.length === 50);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/recommendations/${movieId}`);
  };

  const MovieCard = ({ movie, isLarge = false }) => (
    <div
      className={`movie-card ${isLarge ? 'large' : ''}`}
      onClick={() => handleMovieClick(movie.id)}
    >
      <div className="movie-poster">
        <div className="poster-placeholder">
          <span className="movie-title">{movie.title}</span>
        </div>
        <div className="card-overlay">
          <div className="overlay-content">
            <div className="play-button">▶</div>
            <div className="hover-title">{movie.title}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const MovieRow = ({ title, movies, showArrows = true }) => (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-content">
        {showArrows && movies.length > 5 && (
          <button className="scroll-arrow left" onClick={(e) => {
            e.currentTarget.parentElement.parentElement.querySelector('.row-movies').scrollLeft -= 400;
          }}>
            ‹
          </button>
        )}
        <div className="row-movies">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        {showArrows && movies.length > 5 && (
          <button className="scroll-arrow right" onClick={(e) => {
            e.currentTarget.parentElement.parentElement.querySelector('.row-movies').scrollLeft += 400;
          }}>
            ›
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="smartflix-logo">
          <span className="logo-text">SMARTFLIX</span>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-content">
            <h1 className="hero-title">Smartflix</h1>
            <p className="hero-subtitle">
              AI-powered movie recommendations that understand your taste
            </p>
            <div className="search-container">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search for movies, genres, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="hero-search"
                />
                <div className="search-icon">🔍</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="search-results">
          <h2>Search Results</h2>
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : (
            <div className="search-grid">
              {searchResults.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Movie Rows */}
      {!searchQuery && (
        <div className="movie-rows">
          <MovieRow title="Trending Now" movies={movies.slice(0, 20)} />
          <MovieRow title="Popular on Smartflix" movies={movies.slice(20, 40)} />
          <MovieRow title="New Releases" movies={movies.slice(40, 60)} />
          
          {hasMore && (
            <div className="load-more-section">
              <button className="load-more-btn" onClick={loadMore}>
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Recommendations Page Component
function RecommendationsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMovieAndRecommendations();
  }, [movieId]);

  const fetchMovieAndRecommendations = async () => {
    try {
      const movieRes = await fetch(`http://localhost:3001/api/movies/${movieId}`);
      const movieData = await movieRes.json();
      setMovie(movieData);

      const recRes = await fetch(`http://localhost:3001/api/recommendations/${movieId}`);
      const recData = await recRes.json();
      setRecommendations(recData.recommendations || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setIsLoading(false);
    }
  };

  const RecommendationCard = ({ rec, index }) => (
    <div className="rec-card">
      <div className="rec-poster">
        <div className="rec-number">{index + 1}</div>
        <div className="rec-poster-placeholder">
          <span className="rec-poster-title">{rec.title}</span>
        </div>
      </div>
      <div className="rec-content">
        <h3 className="rec-title">{rec.title}</h3>
        <p className="rec-description">{rec.description}</p>
        <div className="rec-score">
          <span className="score-label">AI Match:</span>
          <span className="score-value">{(rec.score * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="smartflix-logo">
          <span className="logo-text">SMARTFLIX</span>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="rec-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Movies
        </button>
        <div className="rec-hero">
          <h1>AI Recommendations</h1>
          <div className="selected-movie">
            <div className="selected-poster">
              <span className="selected-title">{movie?.title}</span>
            </div>
            <div className="selected-info">
              <h2>{movie?.title}</h2>
              <p className="selected-year">{movie?.year}</p>
              <p className="selected-genre">{movie?.genre}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rec-container">
        <div className="rec-intro">
          <h2>🎯 Top 10 Most Similar Movies</h2>
          <p>Powered by advanced AI embeddings and vector similarity search</p>
        </div>

        <div className="recommendations-grid">
          {recommendations.slice(0, 10).map((rec, index) => (
            <RecommendationCard key={rec.id} rec={rec} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <Router>
      <div className="smartflix-app">
        {/* Fixed Header */}
        <header className="smartflix-header">
          <div className="header-left">
            <div className="smartflix-logo">
              <span className="logo-text">SMARTFLIX</span>
            </div>
            <nav className="header-nav">
              <a href="#" className="nav-link active">Home</a>
              <a href="#" className="nav-link">TV Shows</a>
              <a href="#" className="nav-link">Movies</a>
              <a href="#" className="nav-link">New & Popular</a>
              <a href="#" className="nav-link">My List</a>
            </nav>
          </div>
          
          <div className="header-right">
            <div className="search-icon">🔍</div>
            <div className="user-menu">
              <div className="user-avatar">👤</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recommendations/:movieId" element={<RecommendationsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
