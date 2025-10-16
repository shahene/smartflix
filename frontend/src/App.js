import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Home Page Component
function HomePage({ searchQuery }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    console.log('useEffect triggered for page:', currentPage);
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      if (currentPage > 1) {
        setIsLoadingMore(true);
      }
      
      const res = await fetch(`http://localhost:3001/api/movies?page=${currentPage}&limit=50`);
      const data = await res.json();
      
      console.log(`Page ${currentPage}:`, data.movies.length, 'movies loaded');
      console.log('Total movies so far:', currentPage === 1 ? data.movies.length : movies.length + data.movies.length);
      
      if (currentPage === 1) {
        setMovies(data.movies);
      } else {
        setMovies(prev => [...prev, ...data.movies]);
      }
      
      setHasMore(data.movies.length === 50);
      console.log('hasMore set to:', data.movies.length === 50, 'movies returned:', data.movies.length);
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    console.log('Load More clicked! Current page:', currentPage);
    setCurrentPage(prev => {
      console.log('Setting page from', prev, 'to', prev + 1);
      return prev + 1;
    });
  };

  const handleMovieClick = (movieId) => {
    navigate(`/recommendations/${movieId}`);
  };

  const MovieCard = ({ movie, isLarge = false, isHero = false }) => (
    <div
      className={`movie-card ${isLarge ? 'large' : ''} ${isHero ? 'hero' : ''}`}
      onClick={() => handleMovieClick(movie.id)}
    >
      <div className="movie-poster">
        {movie.poster_url ? (
          <img 
            src={movie.poster_url} 
            alt={movie.title}
            className="poster-image"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="poster-placeholder" style={{ display: movie.poster_url ? 'none' : 'flex' }}>
          <span className="movie-title">{movie.title}</span>
        </div>
        <div className="card-overlay">
          <div className="overlay-content">
            <div className="recommend-button">→</div>
            <div className="hover-title">Find Similar</div>
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
            <div className="hero-featured">
              <div className="hero-movies-horizontal">
                {movies.slice(0, 4).map(movie => (
                  <MovieCard key={movie.id} movie={movie} isHero={true} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Rows */}
      {!searchQuery && (
        <div className="movie-rows">
          <MovieRow title="Trending Now" movies={movies.slice(4, 24)} />
          <MovieRow title="Popular on Smartflix" movies={movies.slice(20, 40)} />
          <MovieRow title="New Releases" movies={movies.slice(40, 60)} />
          
          {hasMore && (
            <div className="load-more-section">
              <button className="load-more-btn" onClick={loadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          {console.log('hasMore in render:', hasMore, 'movies length:', movies.length)}
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
        {rec.poster_url ? (
          <img 
            src={rec.poster_url} 
            alt={rec.title}
            className="rec-poster-image"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="rec-poster-placeholder" style={{ display: rec.poster_url ? 'none' : 'flex' }}>
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
              {movie?.poster_url ? (
                <img 
                  src={movie.poster_url} 
                  alt={movie.title}
                  className="selected-poster-image"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="selected-poster-placeholder" style={{ display: movie?.poster_url ? 'none' : 'flex' }}>
                <span className="selected-title">{movie?.title}</span>
              </div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

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

  return (
    <Router>
      <div className="smartflix-app">

        {/* Info Panel */}
        <div className={`info-panel ${isInfoPanelOpen ? 'open' : ''}`}>
          <div className="info-content">
            <div className="info-header">
              <h2>Smartflix - Movie Discovery</h2>
              <button 
                className="info-close-btn"
                onClick={() => setIsInfoPanelOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="info-section">
              <h3>About This Project</h3>
              <p>A Netflix-inspired movie recommendation platform powered by AI. Built to explore vector embeddings and semantic similarity search for intelligent movie discovery.</p>
            </div>
            
            <div className="info-section">
              <h3>Technical Stack</h3>
              <ul>
                <li><strong>Frontend:</strong> React, Custom CSS</li>
                <li><strong>Backend:</strong> Node.js, Express</li>
                <li><strong>AI/ML:</strong> OpenAI Embeddings, Pinecone Vector Database</li>
                <li><strong>Data:</strong> 10,000+ movies with 99.2% real poster coverage</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>How It Works</h3>
              <p>Each movie description is converted to a 1024-dimensional vector using OpenAI's embedding model. When you select a movie, the system finds the most semantically similar movies using cosine similarity in vector space.</p>
            </div>

            <div className="info-section">
              <h3>About Me</h3>
              <p><strong>Hi, I'm Shahene!</strong></p>
              <p>I'm a junior at UC Berkeley majoring in Applied Mathematics with a minor in Computer Science. I'm passionate about applying mathematical concepts to real-world AI problems and love exploring the intersection of mathematics and machine learning.</p>
              <p>Currently, I work at Cal Hacks (the world's largest collegiate hackathon) as Director of Sponsorships, where I secure sponsorships from technology companies. This year's hackathon is at the Palace of Fine Arts in SF, and I absolutely love hackathons!</p>
              <p>I'm curious, hard-working, and always excited to learn new things.</p>
              <p><strong>Interested in Summer 2026 Internship Opportunities</strong></p>
              <p>This project was inspired by Andrej Karpathy's similar movie recommendation project and built to explore vector embeddings and recommendation algorithms.</p>
            </div>

            <div className="info-section">
              <h3>Key Features</h3>
              <ul>
                <li>Real-time semantic search</li>
                <li>AI-powered recommendations</li>
                <li>Vector similarity matching</li>
                <li>Responsive Netflix-inspired UI</li>
                <li>99.2% movie poster coverage</li>
              </ul>
            </div>
          </div>
        </div>

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
            <div className="header-search-container">
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="header-search"
              />
            </div>
            <button 
              className="header-about-btn"
              onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
            >
              {isInfoPanelOpen ? 'Close' : 'About'}
            </button>
          </div>
        </header>

        {/* Search Results */}
        {searchQuery && (
          <div className="search-results">
            <h2>Search Results</h2>
            {isSearching ? (
              <div className="search-loading">Searching...</div>
            ) : (
              <div className="search-grid">
                {searchResults.map(movie => (
                  <div key={movie.id} className="movie-card" onClick={() => window.location.href = `/recommendations/${movie.id}`}>
                    <div className="movie-poster">
                      {movie.poster_url ? (
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title}
                          className="poster-image"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="poster-placeholder" style={{ display: movie.poster_url ? 'none' : 'flex' }}>
                        <span className="movie-title">{movie.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
            <Route path="/recommendations/:movieId" element={<RecommendationsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
