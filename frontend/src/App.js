import { useEffect, useState, useCallback } from 'react';
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

  const fetchMovies = useCallback(async () => {
    try {
      if (currentPage > 1) {
        setIsLoadingMore(true);
      }
      
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/movies?page=${currentPage}&limit=50`);
      const data = await res.json();
      
      console.log(`Page ${currentPage}:`, data.movies.length, 'movies loaded');
      
      if (currentPage === 1) {
        setMovies(data.movies);
      } else {
        setMovies(prev => {
          console.log('Total movies so far:', prev.length + data.movies.length);
          return [...prev, ...data.movies];
        });
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
  }, [currentPage]);

  useEffect(() => {
    console.log('useEffect triggered for page:', currentPage);
    fetchMovies();
  }, [currentPage, fetchMovies]);

  // Infinite scroll effect
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;
      
      // Debounce scroll events to prevent rapid firing
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Load more when user is 200px from bottom
        if (scrollTop + windowHeight >= documentHeight - 200) {
          console.log('Near bottom, loading more movies...');
          setCurrentPage(prev => prev + 1);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isLoadingMore, hasMore]);


  const handleMovieClick = (movieId) => {
    navigate(`/recommendations/${movieId}`);
  };

  const MovieCard = ({ movie, isLarge = false, isHero = false }) => (
    <div
      key={movie.id}
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
          
          {/* Infinite scroll rows - dynamically add more as we load */}
          {movies.length > 60 && (
            <MovieRow title="More Movies" movies={movies.slice(60, 80)} />
          )}
          {movies.length > 80 && (
            <MovieRow title="Recommended for You" movies={movies.slice(80, 100)} />
          )}
          {movies.length > 100 && (
            <MovieRow title="Recently Added" movies={movies.slice(100, 120)} />
          )}
          {movies.length > 120 && (
            <MovieRow title="Trending This Week" movies={movies.slice(120, 140)} />
          )}
          {movies.length > 140 && (
            <MovieRow title="Top Rated" movies={movies.slice(140, 160)} />
          )}
          {movies.length > 160 && (
            <MovieRow title="Action & Adventure" movies={movies.slice(160, 180)} />
          )}
          {movies.length > 180 && (
            <MovieRow title="Comedy" movies={movies.slice(180, 200)} />
          )}
          {movies.length > 200 && (
            <MovieRow title="Drama" movies={movies.slice(200, 220)} />
          )}
          {movies.length > 220 && (
            <MovieRow title="Sci-Fi & Fantasy" movies={movies.slice(220, 240)} />
          )}
          {movies.length > 240 && (
            <MovieRow title="Horror" movies={movies.slice(240, 260)} />
          )}
          {movies.length > 260 && (
            <MovieRow title="Romance" movies={movies.slice(260, 280)} />
          )}
          {movies.length > 280 && (
            <MovieRow title="Thriller" movies={movies.slice(280, 300)} />
          )}
          {movies.length > 300 && (
            <MovieRow title="Animation" movies={movies.slice(300, 320)} />
          )}
          {movies.length > 320 && (
            <MovieRow title="Documentary" movies={movies.slice(320, 340)} />
          )}
          {movies.length > 340 && (
            <MovieRow title="Family" movies={movies.slice(340, 360)} />
          )}
          {movies.length > 360 && (
            <MovieRow title="Mystery" movies={movies.slice(360, 380)} />
          )}
          {movies.length > 380 && (
            <MovieRow title="Crime" movies={movies.slice(380, 400)} />
          )}
          {movies.length > 400 && (
            <MovieRow title="Biography" movies={movies.slice(400, 420)} />
          )}
          {movies.length > 420 && (
            <MovieRow title="History" movies={movies.slice(420, 440)} />
          )}
          {movies.length > 440 && (
            <MovieRow title="War" movies={movies.slice(440, 460)} />
          )}
          {movies.length > 460 && (
            <MovieRow title="Musical" movies={movies.slice(460, 480)} />
          )}
          {movies.length > 480 && (
            <MovieRow title="Western" movies={movies.slice(480, 500)} />
          )}
          {movies.length > 500 && (
            <MovieRow title="Sport" movies={movies.slice(500, 520)} />
          )}
          {movies.length > 520 && (
            <MovieRow title="Music" movies={movies.slice(520, 540)} />
          )}
          {movies.length > 540 && (
            <MovieRow title="Film-Noir" movies={movies.slice(540, 560)} />
          )}
          {movies.length > 560 && (
            <MovieRow title="Short" movies={movies.slice(560, 580)} />
          )}
          {movies.length > 580 && (
            <MovieRow title="Reality-TV" movies={movies.slice(580, 600)} />
          )}
          {movies.length > 600 && (
            <MovieRow title="Talk-Show" movies={movies.slice(600, 620)} />
          )}
          {movies.length > 620 && (
            <MovieRow title="Game-Show" movies={movies.slice(620, 640)} />
          )}
          {movies.length > 640 && (
            <MovieRow title="News" movies={movies.slice(640, 660)} />
          )}
          {movies.length > 660 && (
            <MovieRow title="Adult" movies={movies.slice(660, 680)} />
          )}
          {movies.length > 680 && (
            <MovieRow title="Experimental" movies={movies.slice(680, 700)} />
          )}
          {movies.length > 700 && (
            <MovieRow title="Concert" movies={movies.slice(700, 720)} />
          )}
          {movies.length > 720 && (
            <MovieRow title="Special" movies={movies.slice(720, 740)} />
          )}
          {movies.length > 740 && (
            <MovieRow title="Award Show" movies={movies.slice(740, 760)} />
          )}
          {movies.length > 760 && (
            <MovieRow title="Variety" movies={movies.slice(760, 780)} />
          )}
          {movies.length > 780 && (
            <MovieRow title="Educational" movies={movies.slice(780, 800)} />
          )}
          {movies.length > 800 && (
            <MovieRow title="Travel" movies={movies.slice(800, 820)} />
          )}
          {movies.length > 820 && (
            <MovieRow title="Lifestyle" movies={movies.slice(820, 840)} />
          )}
          {movies.length > 840 && (
            <MovieRow title="Cooking" movies={movies.slice(840, 860)} />
          )}
          {movies.length > 860 && (
            <MovieRow title="Home & Garden" movies={movies.slice(860, 880)} />
          )}
          {movies.length > 880 && (
            <MovieRow title="Health & Fitness" movies={movies.slice(880, 900)} />
          )}
          {movies.length > 900 && (
            <MovieRow title="Science & Nature" movies={movies.slice(900, 920)} />
          )}
          {movies.length > 920 && (
            <MovieRow title="Technology" movies={movies.slice(920, 940)} />
          )}
          {movies.length > 940 && (
            <MovieRow title="Business" movies={movies.slice(940, 960)} />
          )}
          {movies.length > 960 && (
            <MovieRow title="Politics" movies={movies.slice(960, 980)} />
          )}
          {movies.length > 980 && (
            <MovieRow title="Religion" movies={movies.slice(980, 1000)} />
          )}
          {movies.length > 1000 && (
            <MovieRow title="Philosophy" movies={movies.slice(1000, 1020)} />
          )}
          {movies.length > 1020 && (
            <MovieRow title="Psychology" movies={movies.slice(1020, 1040)} />
          )}
          {movies.length > 1040 && (
            <MovieRow title="Sociology" movies={movies.slice(1040, 1060)} />
          )}
          {movies.length > 1060 && (
            <MovieRow title="Anthropology" movies={movies.slice(1060, 1080)} />
          )}
          {movies.length > 1080 && (
            <MovieRow title="Archaeology" movies={movies.slice(1080, 1100)} />
          )}
          {movies.length > 1100 && (
            <MovieRow title="Astronomy" movies={movies.slice(1100, 1120)} />
          )}
          {movies.length > 1120 && (
            <MovieRow title="Biology" movies={movies.slice(1120, 1140)} />
          )}
          {movies.length > 1140 && (
            <MovieRow title="Chemistry" movies={movies.slice(1140, 1160)} />
          )}
          {movies.length > 1160 && (
            <MovieRow title="Physics" movies={movies.slice(1160, 1180)} />
          )}
          {movies.length > 1180 && (
            <MovieRow title="Mathematics" movies={movies.slice(1180, 1200)} />
          )}
          {movies.length > 1200 && (
            <MovieRow title="Engineering" movies={movies.slice(1200, 1220)} />
          )}
          {movies.length > 1220 && (
            <MovieRow title="Medicine" movies={movies.slice(1220, 1240)} />
          )}
          {movies.length > 1240 && (
            <MovieRow title="Law" movies={movies.slice(1240, 1260)} />
          )}
          {movies.length > 1260 && (
            <MovieRow title="Economics" movies={movies.slice(1260, 1280)} />
          )}
          {movies.length > 1280 && (
            <MovieRow title="Finance" movies={movies.slice(1280, 1300)} />
          )}
          {movies.length > 1300 && (
            <MovieRow title="Marketing" movies={movies.slice(1300, 1320)} />
          )}
          {movies.length > 1320 && (
            <MovieRow title="Management" movies={movies.slice(1320, 1340)} />
          )}
          {movies.length > 1340 && (
            <MovieRow title="Leadership" movies={movies.slice(1340, 1360)} />
          )}
          {movies.length > 1360 && (
            <MovieRow title="Entrepreneurship" movies={movies.slice(1360, 1380)} />
          )}
          {movies.length > 1380 && (
            <MovieRow title="Innovation" movies={movies.slice(1380, 1400)} />
          )}
          {movies.length > 1400 && (
            <MovieRow title="Creativity" movies={movies.slice(1400, 1420)} />
          )}
          {movies.length > 1420 && (
            <MovieRow title="Design" movies={movies.slice(1420, 1440)} />
          )}
          {movies.length > 1440 && (
            <MovieRow title="Art" movies={movies.slice(1440, 1460)} />
          )}
          {movies.length > 1460 && (
            <MovieRow title="Literature" movies={movies.slice(1460, 1480)} />
          )}
          {movies.length > 1480 && (
            <MovieRow title="Poetry" movies={movies.slice(1480, 1500)} />
          )}
          {movies.length > 1500 && (
            <MovieRow title="Theater" movies={movies.slice(1500, 1520)} />
          )}
          {movies.length > 1520 && (
            <MovieRow title="Dance" movies={movies.slice(1520, 1540)} />
          )}
          {movies.length > 1540 && (
            <MovieRow title="Music Performance" movies={movies.slice(1540, 1560)} />
          )}
          {movies.length > 1560 && (
            <MovieRow title="Visual Arts" movies={movies.slice(1560, 1580)} />
          )}
          {movies.length > 1580 && (
            <MovieRow title="Photography" movies={movies.slice(1580, 1600)} />
          )}
          {movies.length > 1600 && (
            <MovieRow title="Sculpture" movies={movies.slice(1600, 1620)} />
          )}
          {movies.length > 1620 && (
            <MovieRow title="Painting" movies={movies.slice(1620, 1640)} />
          )}
          {movies.length > 1640 && (
            <MovieRow title="Drawing" movies={movies.slice(1640, 1660)} />
          )}
          {movies.length > 1660 && (
            <MovieRow title="Printmaking" movies={movies.slice(1660, 1680)} />
          )}
          {movies.length > 1680 && (
            <MovieRow title="Ceramics" movies={movies.slice(1680, 1700)} />
          )}
          {movies.length > 1700 && (
            <MovieRow title="Textiles" movies={movies.slice(1700, 1720)} />
          )}
          {movies.length > 1720 && (
            <MovieRow title="Jewelry" movies={movies.slice(1720, 1740)} />
          )}
          {movies.length > 1740 && (
            <MovieRow title="Fashion" movies={movies.slice(1740, 1760)} />
          )}
          {movies.length > 1760 && (
            <MovieRow title="Architecture" movies={movies.slice(1760, 1780)} />
          )}
          {movies.length > 1780 && (
            <MovieRow title="Urban Planning" movies={movies.slice(1780, 1800)} />
          )}
          {movies.length > 1800 && (
            <MovieRow title="Landscape Design" movies={movies.slice(1800, 1820)} />
          )}
          {movies.length > 1820 && (
            <MovieRow title="Interior Design" movies={movies.slice(1820, 1840)} />
          )}
          {movies.length > 1840 && (
            <MovieRow title="Graphic Design" movies={movies.slice(1840, 1860)} />
          )}
          {movies.length > 1860 && (
            <MovieRow title="Web Design" movies={movies.slice(1860, 1880)} />
          )}
          {movies.length > 1880 && (
            <MovieRow title="UI/UX Design" movies={movies.slice(1880, 1900)} />
          )}
          {movies.length > 1900 && (
            <MovieRow title="Product Design" movies={movies.slice(1900, 1920)} />
          )}
          {movies.length > 1920 && (
            <MovieRow title="Industrial Design" movies={movies.slice(1920, 1940)} />
          )}
          {movies.length > 1940 && (
            <MovieRow title="Automotive Design" movies={movies.slice(1940, 1960)} />
          )}
          {movies.length > 1960 && (
            <MovieRow title="Aerospace Design" movies={movies.slice(1960, 1980)} />
          )}
          {movies.length > 1980 && (
            <MovieRow title="Marine Design" movies={movies.slice(1980, 2000)} />
          )}
          {movies.length > 2000 && (
            <MovieRow title="Furniture Design" movies={movies.slice(2000, 2020)} />
          )}
          {movies.length > 2020 && (
            <MovieRow title="Lighting Design" movies={movies.slice(2020, 2040)} />
          )}
          {movies.length > 2040 && (
            <MovieRow title="Sound Design" movies={movies.slice(2040, 2060)} />
          )}
          {movies.length > 2060 && (
            <MovieRow title="Game Design" movies={movies.slice(2060, 2080)} />
          )}
          {movies.length > 2080 && (
            <MovieRow title="Level Design" movies={movies.slice(2080, 2100)} />
          )}
          {movies.length > 2100 && (
            <MovieRow title="Character Design" movies={movies.slice(2100, 2120)} />
          )}
          {movies.length > 2120 && (
            <MovieRow title="Environment Design" movies={movies.slice(2120, 2140)} />
          )}
          {movies.length > 2140 && (
            <MovieRow title="Narrative Design" movies={movies.slice(2140, 2160)} />
          )}
          {movies.length > 2160 && (
            <MovieRow title="Systems Design" movies={movies.slice(2160, 2180)} />
          )}
          {movies.length > 2180 && (
            <MovieRow title="User Research" movies={movies.slice(2180, 2200)} />
          )}
          {movies.length > 2200 && (
            <MovieRow title="Usability Testing" movies={movies.slice(2200, 2220)} />
          )}
          {movies.length > 2220 && (
            <MovieRow title="Accessibility" movies={movies.slice(2220, 2240)} />
          )}
          {movies.length > 2240 && (
            <MovieRow title="Inclusive Design" movies={movies.slice(2240, 2260)} />
          )}
          {movies.length > 2260 && (
            <MovieRow title="Sustainable Design" movies={movies.slice(2260, 2280)} />
          )}
          {movies.length > 2280 && (
            <MovieRow title="Circular Design" movies={movies.slice(2280, 2300)} />
          )}
          {movies.length > 2300 && (
            <MovieRow title="Biomimetic Design" movies={movies.slice(2300, 2320)} />
          )}
          {movies.length > 2320 && (
            <MovieRow title="Parametric Design" movies={movies.slice(2320, 2340)} />
          )}
          {movies.length > 2340 && (
            <MovieRow title="Generative Design" movies={movies.slice(2340, 2360)} />
          )}
          {movies.length > 2360 && (
            <MovieRow title="Computational Design" movies={movies.slice(2360, 2380)} />
          )}
          {movies.length > 2380 && (
            <MovieRow title="Algorithmic Design" movies={movies.slice(2380, 2400)} />
          )}
          {movies.length > 2400 && (
            <MovieRow title="Machine Learning Design" movies={movies.slice(2400, 2420)} />
          )}
          {movies.length > 2420 && (
            <MovieRow title="AI Design" movies={movies.slice(2420, 2440)} />
          )}
          {movies.length > 2440 && (
            <MovieRow title="Neural Design" movies={movies.slice(2440, 2460)} />
          )}
          {movies.length > 2460 && (
            <MovieRow title="Quantum Design" movies={movies.slice(2460, 2480)} />
          )}
          {movies.length > 2480 && (
            <MovieRow title="Blockchain Design" movies={movies.slice(2480, 2500)} />
          )}
          {movies.length > 2500 && (
            <MovieRow title="Cryptocurrency Design" movies={movies.slice(2500, 2520)} />
          )}
          {movies.length > 2520 && (
            <MovieRow title="NFT Design" movies={movies.slice(2520, 2540)} />
          )}
          {movies.length > 2540 && (
            <MovieRow title="Metaverse Design" movies={movies.slice(2540, 2560)} />
          )}
          {movies.length > 2560 && (
            <MovieRow title="Virtual Reality Design" movies={movies.slice(2560, 2580)} />
          )}
          {movies.length > 2580 && (
            <MovieRow title="Augmented Reality Design" movies={movies.slice(2580, 2600)} />
          )}
          {movies.length > 2600 && (
            <MovieRow title="Mixed Reality Design" movies={movies.slice(2600, 2620)} />
          )}
          {movies.length > 2620 && (
            <MovieRow title="Extended Reality Design" movies={movies.slice(2620, 2640)} />
          )}
          {movies.length > 2640 && (
            <MovieRow title="Spatial Computing Design" movies={movies.slice(2640, 2660)} />
          )}
          {movies.length > 2660 && (
            <MovieRow title="Haptic Design" movies={movies.slice(2660, 2680)} />
          )}
          {movies.length > 2680 && (
            <MovieRow title="Tactile Design" movies={movies.slice(2680, 2700)} />
          )}
          {movies.length > 2700 && (
            <MovieRow title="Kinesthetic Design" movies={movies.slice(2700, 2720)} />
          )}
          {movies.length > 2720 && (
            <MovieRow title="Proprioceptive Design" movies={movies.slice(2720, 2740)} />
          )}
          {movies.length > 2740 && (
            <MovieRow title="Vestibular Design" movies={movies.slice(2740, 2760)} />
          )}
          {movies.length > 2760 && (
            <MovieRow title="Somatosensory Design" movies={movies.slice(2760, 2780)} />
          )}
          {movies.length > 2780 && (
            <MovieRow title="Multisensory Design" movies={movies.slice(2780, 2800)} />
          )}
          {movies.length > 2800 && (
            <MovieRow title="Crossmodal Design" movies={movies.slice(2800, 2820)} />
          )}
          {movies.length > 2820 && (
            <MovieRow title="Synesthetic Design" movies={movies.slice(2820, 2840)} />
          )}
          {movies.length > 2840 && (
            <MovieRow title="Perceptual Design" movies={movies.slice(2840, 2860)} />
          )}
          {movies.length > 2860 && (
            <MovieRow title="Cognitive Design" movies={movies.slice(2860, 2880)} />
          )}
          {movies.length > 2880 && (
            <MovieRow title="Behavioral Design" movies={movies.slice(2880, 2900)} />
          )}
          {movies.length > 2900 && (
            <MovieRow title="Emotional Design" movies={movies.slice(2900, 2920)} />
          )}
          {movies.length > 2920 && (
            <MovieRow title="Affective Design" movies={movies.slice(2920, 2940)} />
          )}
          {movies.length > 2940 && (
            <MovieRow title="Empathetic Design" movies={movies.slice(2940, 2960)} />
          )}
          {movies.length > 2960 && (
            <MovieRow title="Compassionate Design" movies={movies.slice(2960, 2980)} />
          )}
          {movies.length > 2980 && (
            <MovieRow title="Humanitarian Design" movies={movies.slice(2980, 3000)} />
          )}
          {movies.length > 3000 && (
            <MovieRow title="Social Impact Design" movies={movies.slice(3000, 3020)} />
          )}
          {movies.length > 3020 && (
            <MovieRow title="Community Design" movies={movies.slice(3020, 3040)} />
          )}
          {movies.length > 3040 && (
            <MovieRow title="Collaborative Design" movies={movies.slice(3040, 3060)} />
          )}
          {movies.length > 3060 && (
            <MovieRow title="Participatory Design" movies={movies.slice(3060, 3080)} />
          )}
          {movies.length > 3080 && (
            <MovieRow title="Co-design" movies={movies.slice(3080, 3100)} />
          )}
          {movies.length > 3100 && (
            <MovieRow title="Open Design" movies={movies.slice(3100, 3120)} />
          )}
          {movies.length > 3120 && (
            <MovieRow title="Crowdsourced Design" movies={movies.slice(3120, 3140)} />
          )}
          {movies.length > 3140 && (
            <MovieRow title="Distributed Design" movies={movies.slice(3140, 3160)} />
          )}
          {movies.length > 3160 && (
            <MovieRow title="Decentralized Design" movies={movies.slice(3160, 3180)} />
          )}
          {movies.length > 3180 && (
            <MovieRow title="Federated Design" movies={movies.slice(3180, 3200)} />
          )}
          {movies.length > 3200 && (
            <MovieRow title="Mesh Design" movies={movies.slice(3200, 3220)} />
          )}
          {movies.length > 3220 && (
            <MovieRow title="Network Design" movies={movies.slice(3220, 3240)} />
          )}
          {movies.length > 3240 && (
            <MovieRow title="Graph Design" movies={movies.slice(3240, 3260)} />
          )}
          {movies.length > 3260 && (
            <MovieRow title="Tree Design" movies={movies.slice(3260, 3280)} />
          )}
          {movies.length > 3280 && (
            <MovieRow title="Forest Design" movies={movies.slice(3280, 3300)} />
          )}
          {movies.length > 3300 && (
            <MovieRow title="Garden Design" movies={movies.slice(3300, 3320)} />
          )}
          {movies.length > 3320 && (
            <MovieRow title="Ecosystem Design" movies={movies.slice(3320, 3340)} />
          )}
          {movies.length > 3340 && (
            <MovieRow title="Biome Design" movies={movies.slice(3340, 3360)} />
          )}
          {movies.length > 3360 && (
            <MovieRow title="Habitat Design" movies={movies.slice(3360, 3380)} />
          )}
          {movies.length > 3380 && (
            <MovieRow title="Environment Design" movies={movies.slice(3380, 3400)} />
          )}
          {movies.length > 3400 && (
            <MovieRow title="Climate Design" movies={movies.slice(3400, 3420)} />
          )}
          {movies.length > 3420 && (
            <MovieRow title="Weather Design" movies={movies.slice(3420, 3440)} />
          )}
          {movies.length > 3440 && (
            <MovieRow title="Atmospheric Design" movies={movies.slice(3440, 3460)} />
          )}
          {movies.length > 3460 && (
            <MovieRow title="Meteorological Design" movies={movies.slice(3460, 3480)} />
          )}
          {movies.length > 3480 && (
            <MovieRow title="Geological Design" movies={movies.slice(3480, 3500)} />
          )}
          {movies.length > 3500 && (
            <MovieRow title="Geographical Design" movies={movies.slice(3500, 3520)} />
          )}
          {movies.length > 3520 && (
            <MovieRow title="Topographical Design" movies={movies.slice(3520, 3540)} />
          )}
          {movies.length > 3540 && (
            <MovieRow title="Cartographical Design" movies={movies.slice(3540, 3560)} />
          )}
          {movies.length > 3560 && (
            <MovieRow title="Navigational Design" movies={movies.slice(3560, 3580)} />
          )}
          {movies.length > 3580 && (
            <MovieRow title="Wayfinding Design" movies={movies.slice(3580, 3600)} />
          )}
          {movies.length > 3600 && (
            <MovieRow title="Signage Design" movies={movies.slice(3600, 3620)} />
          )}
          {movies.length > 3620 && (
            <MovieRow title="Typography Design" movies={movies.slice(3620, 3640)} />
          )}
          {movies.length > 3640 && (
            <MovieRow title="Lettering Design" movies={movies.slice(3640, 3660)} />
          )}
          {movies.length > 3660 && (
            <MovieRow title="Calligraphy Design" movies={movies.slice(3660, 3680)} />
          )}
          {movies.length > 3680 && (
            <MovieRow title="Handwriting Design" movies={movies.slice(3680, 3700)} />
          )}
          {movies.length > 3700 && (
            <MovieRow title="Script Design" movies={movies.slice(3700, 3720)} />
          )}
          {movies.length > 3720 && (
            <MovieRow title="Font Design" movies={movies.slice(3720, 3740)} />
          )}
          {movies.length > 3740 && (
            <MovieRow title="Typeface Design" movies={movies.slice(3740, 3760)} />
          )}
          {movies.length > 3760 && (
            <MovieRow title="Character Design" movies={movies.slice(3760, 3780)} />
          )}
          {movies.length > 3780 && (
            <MovieRow title="Glyph Design" movies={movies.slice(3780, 3800)} />
          )}
          {movies.length > 3800 && (
            <MovieRow title="Symbol Design" movies={movies.slice(3800, 3820)} />
          )}
          {movies.length > 3820 && (
            <MovieRow title="Icon Design" movies={movies.slice(3820, 3840)} />
          )}
          {movies.length > 3840 && (
            <MovieRow title="Logo Design" movies={movies.slice(3840, 3860)} />
          )}
          {movies.length > 3860 && (
            <MovieRow title="Brand Design" movies={movies.slice(3860, 3880)} />
          )}
          {movies.length > 3880 && (
            <MovieRow title="Identity Design" movies={movies.slice(3880, 3900)} />
          )}
          {movies.length > 3900 && (
            <MovieRow title="Corporate Design" movies={movies.slice(3900, 3920)} />
          )}
          {movies.length > 3920 && (
            <MovieRow title="Institutional Design" movies={movies.slice(3920, 3940)} />
          )}
          {movies.length > 3940 && (
            <MovieRow title="Organizational Design" movies={movies.slice(3940, 3960)} />
          )}
          {movies.length > 3960 && (
            <MovieRow title="System Design" movies={movies.slice(3960, 3980)} />
          )}
          {movies.length > 3980 && (
            <MovieRow title="Service Design" movies={movies.slice(3980, 4000)} />
          )}
          {movies.length > 4000 && (
            <MovieRow title="Experience Design" movies={movies.slice(4000, 4020)} />
          )}
          {movies.length > 4020 && (
            <MovieRow title="Journey Design" movies={movies.slice(4020, 4040)} />
          )}
          {movies.length > 4040 && (
            <MovieRow title="Process Design" movies={movies.slice(4040, 4060)} />
          )}
          {movies.length > 4060 && (
            <MovieRow title="Workflow Design" movies={movies.slice(4060, 4080)} />
          )}
          {movies.length > 4080 && (
            <MovieRow title="Procedure Design" movies={movies.slice(4080, 4100)} />
          )}
          {movies.length > 4100 && (
            <MovieRow title="Protocol Design" movies={movies.slice(4100, 4120)} />
          )}
          {movies.length > 4120 && (
            <MovieRow title="Standard Design" movies={movies.slice(4120, 4140)} />
          )}
          {movies.length > 4140 && (
            <MovieRow title="Specification Design" movies={movies.slice(4140, 4160)} />
          )}
          {movies.length > 4160 && (
            <MovieRow title="Guideline Design" movies={movies.slice(4160, 4180)} />
          )}
          {movies.length > 4180 && (
            <MovieRow title="Policy Design" movies={movies.slice(4180, 4200)} />
          )}
          {movies.length > 4200 && (
            <MovieRow title="Regulation Design" movies={movies.slice(4200, 4220)} />
          )}
          {movies.length > 4220 && (
            <MovieRow title="Compliance Design" movies={movies.slice(4220, 4240)} />
          )}
          {movies.length > 4240 && (
            <MovieRow title="Governance Design" movies={movies.slice(4240, 4260)} />
          )}
          {movies.length > 4260 && (
            <MovieRow title="Management Design" movies={movies.slice(4260, 4280)} />
          )}
          {movies.length > 4280 && (
            <MovieRow title="Leadership Design" movies={movies.slice(4280, 4300)} />
          )}
          {movies.length > 4300 && (
            <MovieRow title="Strategy Design" movies={movies.slice(4300, 4320)} />
          )}
          {movies.length > 4320 && (
            <MovieRow title="Tactical Design" movies={movies.slice(4320, 4340)} />
          )}
          {movies.length > 4340 && (
            <MovieRow title="Operational Design" movies={movies.slice(4340, 4360)} />
          )}
          {movies.length > 4360 && (
            <MovieRow title="Execution Design" movies={movies.slice(4360, 4380)} />
          )}
          {movies.length > 4380 && (
            <MovieRow title="Implementation Design" movies={movies.slice(4380, 4400)} />
          )}
          {movies.length > 4400 && (
            <MovieRow title="Deployment Design" movies={movies.slice(4400, 4420)} />
          )}
          {movies.length > 4420 && (
            <MovieRow title="Rollout Design" movies={movies.slice(4420, 4440)} />
          )}
          {movies.length > 4440 && (
            <MovieRow title="Launch Design" movies={movies.slice(4440, 4460)} />
          )}
          {movies.length > 4460 && (
            <MovieRow title="Release Design" movies={movies.slice(4460, 4480)} />
          )}
          {movies.length > 4480 && (
            <MovieRow title="Distribution Design" movies={movies.slice(4480, 4500)} />
          )}
          {movies.length > 4500 && (
            <MovieRow title="Delivery Design" movies={movies.slice(4500, 4520)} />
          )}
          {movies.length > 4520 && (
            <MovieRow title="Logistics Design" movies={movies.slice(4520, 4540)} />
          )}
          {movies.length > 4540 && (
            <MovieRow title="Supply Chain Design" movies={movies.slice(4540, 4560)} />
          )}
          {movies.length > 4560 && (
            <MovieRow title="Value Chain Design" movies={movies.slice(4560, 4580)} />
          )}
          {movies.length > 4580 && (
            <MovieRow title="Ecosystem Design" movies={movies.slice(4580, 4600)} />
          )}
          {movies.length > 4600 && (
            <MovieRow title="Platform Design" movies={movies.slice(4600, 4620)} />
          )}
          {movies.length > 4620 && (
            <MovieRow title="Infrastructure Design" movies={movies.slice(4620, 4640)} />
          )}
          {movies.length > 4640 && (
            <MovieRow title="Architecture Design" movies={movies.slice(4640, 4660)} />
          )}
          {movies.length > 4660 && (
            <MovieRow title="Framework Design" movies={movies.slice(4660, 4680)} />
          )}
          {movies.length > 4680 && (
            <MovieRow title="Structure Design" movies={movies.slice(4680, 4700)} />
          )}
          {movies.length > 4700 && (
            <MovieRow title="Foundation Design" movies={movies.slice(4700, 4720)} />
          )}
          {movies.length > 4720 && (
            <MovieRow title="Base Design" movies={movies.slice(4720, 4740)} />
          )}
          {movies.length > 4740 && (
            <MovieRow title="Core Design" movies={movies.slice(4740, 4760)} />
          )}
          {movies.length > 4760 && (
            <MovieRow title="Essential Design" movies={movies.slice(4760, 4780)} />
          )}
          {movies.length > 4780 && (
            <MovieRow title="Fundamental Design" movies={movies.slice(4780, 4800)} />
          )}
          {movies.length > 4800 && (
            <MovieRow title="Basic Design" movies={movies.slice(4800, 4820)} />
          )}
          {movies.length > 4820 && (
            <MovieRow title="Elementary Design" movies={movies.slice(4820, 4840)} />
          )}
          {movies.length > 4840 && (
            <MovieRow title="Primary Design" movies={movies.slice(4840, 4860)} />
          )}
          {movies.length > 4860 && (
            <MovieRow title="Secondary Design" movies={movies.slice(4860, 4880)} />
          )}
          {movies.length > 4880 && (
            <MovieRow title="Tertiary Design" movies={movies.slice(4880, 4900)} />
          )}
          {movies.length > 4900 && (
            <MovieRow title="Quaternary Design" movies={movies.slice(4900, 4920)} />
          )}
          {movies.length > 4920 && (
            <MovieRow title="Quinary Design" movies={movies.slice(4920, 4940)} />
          )}
          {movies.length > 4940 && (
            <MovieRow title="Senary Design" movies={movies.slice(4940, 4960)} />
          )}
          {movies.length > 4960 && (
            <MovieRow title="Septenary Design" movies={movies.slice(4960, 4980)} />
          )}
          {movies.length > 4980 && (
            <MovieRow title="Octonary Design" movies={movies.slice(4980, 5000)} />
          )}
          {movies.length > 5000 && (
            <MovieRow title="Nonary Design" movies={movies.slice(5000, 5020)} />
          )}
          {movies.length > 5020 && (
            <MovieRow title="Denary Design" movies={movies.slice(5020, 5040)} />
          )}
          {movies.length > 5040 && (
            <MovieRow title="Undenary Design" movies={movies.slice(5040, 5060)} />
          )}
          {movies.length > 5060 && (
            <MovieRow title="Duodenary Design" movies={movies.slice(5060, 5080)} />
          )}
          {movies.length > 5080 && (
            <MovieRow title="Tredenary Design" movies={movies.slice(5080, 5100)} />
          )}
          {movies.length > 5100 && (
            <MovieRow title="Quattuordenary Design" movies={movies.slice(5100, 5120)} />
          )}
          {movies.length > 5120 && (
            <MovieRow title="Quindenary Design" movies={movies.slice(5120, 5140)} />
          )}
          {movies.length > 5140 && (
            <MovieRow title="Sexdenary Design" movies={movies.slice(5140, 5160)} />
          )}
          {movies.length > 5160 && (
            <MovieRow title="Septendenary Design" movies={movies.slice(5160, 5180)} />
          )}
          {movies.length > 5180 && (
            <MovieRow title="Octodenary Design" movies={movies.slice(5180, 5200)} />
          )}
          {movies.length > 5200 && (
            <MovieRow title="Novemdenary Design" movies={movies.slice(5200, 5220)} />
          )}
          {movies.length > 5220 && (
            <MovieRow title="Vigintenary Design" movies={movies.slice(5220, 5240)} />
          )}
          {movies.length > 5240 && (
            <MovieRow title="Unvigintenary Design" movies={movies.slice(5240, 5260)} />
          )}
          {movies.length > 5260 && (
            <MovieRow title="Duovigintenary Design" movies={movies.slice(5260, 5280)} />
          )}
          {movies.length > 5280 && (
            <MovieRow title="Trevigintenary Design" movies={movies.slice(5280, 5300)} />
          )}
          {movies.length > 5300 && (
            <MovieRow title="Quattuorvigintenary Design" movies={movies.slice(5300, 5320)} />
          )}
          {movies.length > 5320 && (
            <MovieRow title="Quinvigintenary Design" movies={movies.slice(5320, 5340)} />
          )}
          {movies.length > 5340 && (
            <MovieRow title="Sexvigintenary Design" movies={movies.slice(5340, 5360)} />
          )}
          {movies.length > 5360 && (
            <MovieRow title="Septenvigintenary Design" movies={movies.slice(5360, 5380)} />
          )}
          {movies.length > 5380 && (
            <MovieRow title="Octovigintenary Design" movies={movies.slice(5380, 5400)} />
          )}
          {movies.length > 5400 && (
            <MovieRow title="Novemvigintenary Design" movies={movies.slice(5400, 5420)} />
          )}
          {movies.length > 5420 && (
            <MovieRow title="Trigintenary Design" movies={movies.slice(5420, 5440)} />
          )}
          {movies.length > 5440 && (
            <MovieRow title="Untrigintenary Design" movies={movies.slice(5440, 5460)} />
          )}
          {movies.length > 5460 && (
            <MovieRow title="Duotrigintenary Design" movies={movies.slice(5460, 5480)} />
          )}
          {movies.length > 5480 && (
            <MovieRow title="Tretrigintenary Design" movies={movies.slice(5480, 5500)} />
          )}
          {movies.length > 5500 && (
            <MovieRow title="Quattuortrigintenary Design" movies={movies.slice(5500, 5520)} />
          )}
          {movies.length > 5520 && (
            <MovieRow title="Quintrigintenary Design" movies={movies.slice(5520, 5540)} />
          )}
          {movies.length > 5540 && (
            <MovieRow title="Sextrigintenary Design" movies={movies.slice(5540, 5560)} />
          )}
          {movies.length > 5560 && (
            <MovieRow title="Septentrigintenary Design" movies={movies.slice(5560, 5580)} />
          )}
          {movies.length > 5580 && (
            <MovieRow title="Octotrigintenary Design" movies={movies.slice(5580, 5600)} />
          )}
          {movies.length > 5600 && (
            <MovieRow title="Novemtrigintenary Design" movies={movies.slice(5600, 5620)} />
          )}
          {movies.length > 5620 && (
            <MovieRow title="Quadragintenary Design" movies={movies.slice(5620, 5640)} />
          )}
          {movies.length > 5640 && (
            <MovieRow title="Unquadragintenary Design" movies={movies.slice(5640, 5660)} />
          )}
          {movies.length > 5660 && (
            <MovieRow title="Duoquadragintenary Design" movies={movies.slice(5660, 5680)} />
          )}
          {movies.length > 5680 && (
            <MovieRow title="Trequadragintenary Design" movies={movies.slice(5680, 5700)} />
          )}
          {movies.length > 5700 && (
            <MovieRow title="Quattuorquadragintenary Design" movies={movies.slice(5700, 5720)} />
          )}
          {movies.length > 5720 && (
            <MovieRow title="Quinquadragintenary Design" movies={movies.slice(5720, 5740)} />
          )}
          {movies.length > 5740 && (
            <MovieRow title="Sexquadragintenary Design" movies={movies.slice(5740, 5760)} />
          )}
          {movies.length > 5760 && (
            <MovieRow title="Septenquadragintenary Design" movies={movies.slice(5760, 5780)} />
          )}
          {movies.length > 5780 && (
            <MovieRow title="Octoquadragintenary Design" movies={movies.slice(5780, 5800)} />
          )}
          {movies.length > 5800 && (
            <MovieRow title="Novemquadragintenary Design" movies={movies.slice(5800, 5820)} />
          )}
          {movies.length > 5820 && (
            <MovieRow title="Quinquagintenary Design" movies={movies.slice(5820, 5840)} />
          )}
          {movies.length > 5840 && (
            <MovieRow title="Unquinquagintenary Design" movies={movies.slice(5840, 5860)} />
          )}
          {movies.length > 5860 && (
            <MovieRow title="Duoquinquagintenary Design" movies={movies.slice(5860, 5880)} />
          )}
          {movies.length > 5880 && (
            <MovieRow title="Trequinquagintenary Design" movies={movies.slice(5880, 5900)} />
          )}
          {movies.length > 5900 && (
            <MovieRow title="Quattuorquinquagintenary Design" movies={movies.slice(5900, 5920)} />
          )}
          {movies.length > 5920 && (
            <MovieRow title="Quinquinquagintenary Design" movies={movies.slice(5920, 5940)} />
          )}
          {movies.length > 5940 && (
            <MovieRow title="Sexquinquagintenary Design" movies={movies.slice(5940, 5960)} />
          )}
          {movies.length > 5960 && (
            <MovieRow title="Septenquinquagintenary Design" movies={movies.slice(5960, 5980)} />
          )}
          {movies.length > 5980 && (
            <MovieRow title="Octoquinquagintenary Design" movies={movies.slice(5980, 6000)} />
          )}
          {movies.length > 6000 && (
            <MovieRow title="Novemquinquagintenary Design" movies={movies.slice(6000, 6020)} />
          )}
          {movies.length > 6020 && (
            <MovieRow title="Sexagintenary Design" movies={movies.slice(6020, 6040)} />
          )}
          {movies.length > 6040 && (
            <MovieRow title="Unsexagintenary Design" movies={movies.slice(6040, 6060)} />
          )}
          {movies.length > 6060 && (
            <MovieRow title="Duosexagintenary Design" movies={movies.slice(6060, 6080)} />
          )}
          {movies.length > 6080 && (
            <MovieRow title="Tresexagintenary Design" movies={movies.slice(6080, 6100)} />
          )}
          {movies.length > 6100 && (
            <MovieRow title="Quattuorsexagintenary Design" movies={movies.slice(6100, 6120)} />
          )}
          {movies.length > 6120 && (
            <MovieRow title="Quinsexagintenary Design" movies={movies.slice(6120, 6140)} />
          )}
          {movies.length > 6140 && (
            <MovieRow title="Sexsexagintenary Design" movies={movies.slice(6140, 6160)} />
          )}
          {movies.length > 6160 && (
            <MovieRow title="Septensexagintenary Design" movies={movies.slice(6160, 6180)} />
          )}
          {movies.length > 6180 && (
            <MovieRow title="Octosexagintenary Design" movies={movies.slice(6180, 6200)} />
          )}
          {movies.length > 6200 && (
            <MovieRow title="Novemsexagintenary Design" movies={movies.slice(6200, 6220)} />
          )}
          {movies.length > 6220 && (
            <MovieRow title="Septuagintenary Design" movies={movies.slice(6220, 6240)} />
          )}
          {movies.length > 6240 && (
            <MovieRow title="Unseptuagintenary Design" movies={movies.slice(6240, 6260)} />
          )}
          {movies.length > 6260 && (
            <MovieRow title="Duoseptuagintenary Design" movies={movies.slice(6260, 6280)} />
          )}
          {movies.length > 6280 && (
            <MovieRow title="Treseptuagintenary Design" movies={movies.slice(6280, 6300)} />
          )}
          {movies.length > 6300 && (
            <MovieRow title="Quattuorseptuagintenary Design" movies={movies.slice(6300, 6320)} />
          )}
          {movies.length > 6320 && (
            <MovieRow title="Quinseptuagintenary Design" movies={movies.slice(6320, 6340)} />
          )}
          {movies.length > 6340 && (
            <MovieRow title="Sexseptuagintenary Design" movies={movies.slice(6340, 6360)} />
          )}
          {movies.length > 6360 && (
            <MovieRow title="Septenseptuagintenary Design" movies={movies.slice(6360, 6380)} />
          )}
          {movies.length > 6380 && (
            <MovieRow title="Octoseptuagintenary Design" movies={movies.slice(6380, 6400)} />
          )}
          {movies.length > 6400 && (
            <MovieRow title="Novemseptuagintenary Design" movies={movies.slice(6400, 6420)} />
          )}
          {movies.length > 6420 && (
            <MovieRow title="Octogintenary Design" movies={movies.slice(6420, 6440)} />
          )}
          {movies.length > 6440 && (
            <MovieRow title="Unoctogintenary Design" movies={movies.slice(6440, 6460)} />
          )}
          {movies.length > 6460 && (
            <MovieRow title="Duooctogintenary Design" movies={movies.slice(6460, 6480)} />
          )}
          {movies.length > 6480 && (
            <MovieRow title="Treoctogintenary Design" movies={movies.slice(6480, 6500)} />
          )}
          {movies.length > 6500 && (
            <MovieRow title="Quattuoroctogintenary Design" movies={movies.slice(6500, 6520)} />
          )}
          {movies.length > 6520 && (
            <MovieRow title="Quinoctogintenary Design" movies={movies.slice(6520, 6540)} />
          )}
          {movies.length > 6540 && (
            <MovieRow title="Sexoctogintenary Design" movies={movies.slice(6540, 6560)} />
          )}
          {movies.length > 6560 && (
            <MovieRow title="Septenoctogintenary Design" movies={movies.slice(6560, 6580)} />
          )}
          {movies.length > 6580 && (
            <MovieRow title="Octooctogintenary Design" movies={movies.slice(6580, 6600)} />
          )}
          {movies.length > 6600 && (
            <MovieRow title="Novemoctogintenary Design" movies={movies.slice(6600, 6620)} />
          )}
          {movies.length > 6620 && (
            <MovieRow title="Nonagintenary Design" movies={movies.slice(6620, 6640)} />
          )}
          {movies.length > 6640 && (
            <MovieRow title="Unnonagintenary Design" movies={movies.slice(6640, 6660)} />
          )}
          {movies.length > 6660 && (
            <MovieRow title="Duononagintenary Design" movies={movies.slice(6660, 6680)} />
          )}
          {movies.length > 6680 && (
            <MovieRow title="Trenonagintenary Design" movies={movies.slice(6680, 6700)} />
          )}
          {movies.length > 6700 && (
            <MovieRow title="Quattuornonagintenary Design" movies={movies.slice(6700, 6720)} />
          )}
          {movies.length > 6720 && (
            <MovieRow title="Quinnonagintenary Design" movies={movies.slice(6720, 6740)} />
          )}
          {movies.length > 6740 && (
            <MovieRow title="Sexnonagintenary Design" movies={movies.slice(6740, 6760)} />
          )}
          {movies.length > 6760 && (
            <MovieRow title="Septennonagintenary Design" movies={movies.slice(6760, 6780)} />
          )}
          {movies.length > 6780 && (
            <MovieRow title="Octononagintenary Design" movies={movies.slice(6780, 6800)} />
          )}
          {movies.length > 6800 && (
            <MovieRow title="Novemnonagintenary Design" movies={movies.slice(6800, 6820)} />
          )}
          {movies.length > 6820 && (
            <MovieRow title="Centenary Design" movies={movies.slice(6820, 6840)} />
          )}
          {movies.length > 6840 && (
            <MovieRow title="Uncentenary Design" movies={movies.slice(6840, 6860)} />
          )}
          {movies.length > 6860 && (
            <MovieRow title="Duocentenary Design" movies={movies.slice(6860, 6880)} />
          )}
          {movies.length > 6880 && (
            <MovieRow title="Trecentenary Design" movies={movies.slice(6880, 6900)} />
          )}
          {movies.length > 6900 && (
            <MovieRow title="Quattuorcentenary Design" movies={movies.slice(6900, 6920)} />
          )}
          {movies.length > 6920 && (
            <MovieRow title="Quincentenary Design" movies={movies.slice(6920, 6940)} />
          )}
          {movies.length > 6940 && (
            <MovieRow title="Sexcentenary Design" movies={movies.slice(6940, 6960)} />
          )}
          {movies.length > 6960 && (
            <MovieRow title="Septencentenary Design" movies={movies.slice(6960, 6980)} />
          )}
          {movies.length > 6980 && (
            <MovieRow title="Octocentenary Design" movies={movies.slice(6980, 7000)} />
          )}
          {movies.length > 7000 && (
            <MovieRow title="Novemcentenary Design" movies={movies.slice(7000, 7020)} />
          )}
          {movies.length > 7020 && (
            <MovieRow title="Ducentenary Design" movies={movies.slice(7020, 7040)} />
          )}
          {movies.length > 7040 && (
            <MovieRow title="Unducentenary Design" movies={movies.slice(7040, 7060)} />
          )}
          {movies.length > 7060 && (
            <MovieRow title="Duoducentenary Design" movies={movies.slice(7060, 7080)} />
          )}
          {movies.length > 7080 && (
            <MovieRow title="Treducentenary Design" movies={movies.slice(7080, 7100)} />
          )}
          {movies.length > 7100 && (
            <MovieRow title="Quattuorducentenary Design" movies={movies.slice(7100, 7120)} />
          )}
          {movies.length > 7120 && (
            <MovieRow title="Quinducentenary Design" movies={movies.slice(7120, 7140)} />
          )}
          {movies.length > 7140 && (
            <MovieRow title="Sexducentenary Design" movies={movies.slice(7140, 7160)} />
          )}
          {movies.length > 7160 && (
            <MovieRow title="Septenducentenary Design" movies={movies.slice(7160, 7180)} />
          )}
          {movies.length > 7180 && (
            <MovieRow title="Octoducentenary Design" movies={movies.slice(7180, 7200)} />
          )}
          {movies.length > 7200 && (
            <MovieRow title="Novemducentenary Design" movies={movies.slice(7200, 7220)} />
          )}
          {movies.length > 7220 && (
            <MovieRow title="Trecentenary Design" movies={movies.slice(7220, 7240)} />
          )}
          {movies.length > 7240 && (
            <MovieRow title="Untrecentenary Design" movies={movies.slice(7240, 7260)} />
          )}
          {movies.length > 7260 && (
            <MovieRow title="Duotrecentenary Design" movies={movies.slice(7260, 7280)} />
          )}
          {movies.length > 7280 && (
            <MovieRow title="Tretrecentenary Design" movies={movies.slice(7280, 7300)} />
          )}
          {movies.length > 7300 && (
            <MovieRow title="Quattuortrecentenary Design" movies={movies.slice(7300, 7320)} />
          )}
          {movies.length > 7320 && (
            <MovieRow title="Quintrecentenary Design" movies={movies.slice(7320, 7340)} />
          )}
          {movies.length > 7340 && (
            <MovieRow title="Sextrecentenary Design" movies={movies.slice(7340, 7360)} />
          )}
          {movies.length > 7360 && (
            <MovieRow title="Septentrecentenary Design" movies={movies.slice(7360, 7380)} />
          )}
          {movies.length > 7380 && (
            <MovieRow title="Octotrecentenary Design" movies={movies.slice(7380, 7400)} />
          )}
          {movies.length > 7400 && (
            <MovieRow title="Novemtrecentenary Design" movies={movies.slice(7400, 7420)} />
          )}
          {movies.length > 7420 && (
            <MovieRow title="Quadringentenary Design" movies={movies.slice(7420, 7440)} />
          )}
          {movies.length > 7440 && (
            <MovieRow title="Unquadringentenary Design" movies={movies.slice(7440, 7460)} />
          )}
          {movies.length > 7460 && (
            <MovieRow title="Duoquadringentenary Design" movies={movies.slice(7460, 7480)} />
          )}
          {movies.length > 7480 && (
            <MovieRow title="Trequadringentenary Design" movies={movies.slice(7480, 7500)} />
          )}
          {movies.length > 7500 && (
            <MovieRow title="Quattuorquadringentenary Design" movies={movies.slice(7500, 7520)} />
          )}
          {movies.length > 7520 && (
            <MovieRow title="Quinquadringentenary Design" movies={movies.slice(7520, 7540)} />
          )}
          {movies.length > 7540 && (
            <MovieRow title="Sexquadringentenary Design" movies={movies.slice(7540, 7560)} />
          )}
          {movies.length > 7560 && (
            <MovieRow title="Septenquadringentenary Design" movies={movies.slice(7560, 7580)} />
          )}
          {movies.length > 7580 && (
            <MovieRow title="Octoquadringentenary Design" movies={movies.slice(7580, 7600)} />
          )}
          {movies.length > 7600 && (
            <MovieRow title="Novemquadringentenary Design" movies={movies.slice(7600, 7620)} />
          )}
          {movies.length > 7620 && (
            <MovieRow title="Quingentenary Design" movies={movies.slice(7620, 7640)} />
          )}
          {movies.length > 7640 && (
            <MovieRow title="Unquingentenary Design" movies={movies.slice(7640, 7660)} />
          )}
          {movies.length > 7660 && (
            <MovieRow title="Duoquingentenary Design" movies={movies.slice(7660, 7680)} />
          )}
          {movies.length > 7680 && (
            <MovieRow title="Trequingentenary Design" movies={movies.slice(7680, 7700)} />
          )}
          {movies.length > 7700 && (
            <MovieRow title="Quattuorquingentenary Design" movies={movies.slice(7700, 7720)} />
          )}
          {movies.length > 7720 && (
            <MovieRow title="Quinquingentenary Design" movies={movies.slice(7720, 7740)} />
          )}
          {movies.length > 7740 && (
            <MovieRow title="Sexquingentenary Design" movies={movies.slice(7740, 7760)} />
          )}
          {movies.length > 7760 && (
            <MovieRow title="Septenquingentenary Design" movies={movies.slice(7760, 7780)} />
          )}
          {movies.length > 7780 && (
            <MovieRow title="Octoquingentenary Design" movies={movies.slice(7780, 7800)} />
          )}
          {movies.length > 7800 && (
            <MovieRow title="Novemquingentenary Design" movies={movies.slice(7800, 7820)} />
          )}
          {movies.length > 7820 && (
            <MovieRow title="Sescentenary Design" movies={movies.slice(7820, 7840)} />
          )}
          {movies.length > 7840 && (
            <MovieRow title="Unsescentenary Design" movies={movies.slice(7840, 7860)} />
          )}
          {movies.length > 7860 && (
            <MovieRow title="Duosescentenary Design" movies={movies.slice(7860, 7880)} />
          )}
          {movies.length > 7880 && (
            <MovieRow title="Tresescentenary Design" movies={movies.slice(7880, 7900)} />
          )}
          {movies.length > 7900 && (
            <MovieRow title="Quattuorsescentenary Design" movies={movies.slice(7900, 7920)} />
          )}
          {movies.length > 7920 && (
            <MovieRow title="Quinsescentenary Design" movies={movies.slice(7920, 7940)} />
          )}
          {movies.length > 7940 && (
            <MovieRow title="Sexsescentenary Design" movies={movies.slice(7940, 7960)} />
          )}
          {movies.length > 7960 && (
            <MovieRow title="Septensescentenary Design" movies={movies.slice(7960, 7980)} />
          )}
          {movies.length > 7980 && (
            <MovieRow title="Octosescentenary Design" movies={movies.slice(7980, 8000)} />
          )}
          {movies.length > 8000 && (
            <MovieRow title="Novemsescentenary Design" movies={movies.slice(8000, 8020)} />
          )}
          {movies.length > 8020 && (
            <MovieRow title="Septingentenary Design" movies={movies.slice(8020, 8040)} />
          )}
          {movies.length > 8040 && (
            <MovieRow title="Unseptingentenary Design" movies={movies.slice(8040, 8060)} />
          )}
          {movies.length > 8060 && (
            <MovieRow title="Duoseptingentenary Design" movies={movies.slice(8060, 8080)} />
          )}
          {movies.length > 8080 && (
            <MovieRow title="Treseptingentenary Design" movies={movies.slice(8080, 8100)} />
          )}
          {movies.length > 8100 && (
            <MovieRow title="Quattuorseptingentenary Design" movies={movies.slice(8100, 8120)} />
          )}
          {movies.length > 8120 && (
            <MovieRow title="Quinseptingentenary Design" movies={movies.slice(8120, 8140)} />
          )}
          {movies.length > 8140 && (
            <MovieRow title="Sexseptingentenary Design" movies={movies.slice(8140, 8160)} />
          )}
          {movies.length > 8160 && (
            <MovieRow title="Septenseptingentenary Design" movies={movies.slice(8160, 8180)} />
          )}
          {movies.length > 8180 && (
            <MovieRow title="Octoseptingentenary Design" movies={movies.slice(8180, 8200)} />
          )}
          {movies.length > 8200 && (
            <MovieRow title="Novemseptingentenary Design" movies={movies.slice(8200, 8220)} />
          )}
          {movies.length > 8220 && (
            <MovieRow title="Octingentenary Design" movies={movies.slice(8220, 8240)} />
          )}
          {movies.length > 8240 && (
            <MovieRow title="Unoctingentenary Design" movies={movies.slice(8240, 8260)} />
          )}
          {movies.length > 8260 && (
            <MovieRow title="Duooctingentenary Design" movies={movies.slice(8260, 8280)} />
          )}
          {movies.length > 8280 && (
            <MovieRow title="Treoctingentenary Design" movies={movies.slice(8280, 8300)} />
          )}
          {movies.length > 8300 && (
            <MovieRow title="Quattuoroctingentenary Design" movies={movies.slice(8300, 8320)} />
          )}
          {movies.length > 8320 && (
            <MovieRow title="Quinoctingentenary Design" movies={movies.slice(8320, 8340)} />
          )}
          {movies.length > 8340 && (
            <MovieRow title="Sexoctingentenary Design" movies={movies.slice(8340, 8360)} />
          )}
          {movies.length > 8360 && (
            <MovieRow title="Septenoctingentenary Design" movies={movies.slice(8360, 8380)} />
          )}
          {movies.length > 8380 && (
            <MovieRow title="Octooctingentenary Design" movies={movies.slice(8380, 8400)} />
          )}
          {movies.length > 8400 && (
            <MovieRow title="Novemoctingentenary Design" movies={movies.slice(8400, 8420)} />
          )}
          {movies.length > 8420 && (
            <MovieRow title="Nongentenary Design" movies={movies.slice(8420, 8440)} />
          )}
          {movies.length > 8440 && (
            <MovieRow title="Unnongentenary Design" movies={movies.slice(8440, 8460)} />
          )}
          {movies.length > 8460 && (
            <MovieRow title="Duonongentenary Design" movies={movies.slice(8460, 8480)} />
          )}
          {movies.length > 8480 && (
            <MovieRow title="Trenongentenary Design" movies={movies.slice(8480, 8500)} />
          )}
          {movies.length > 8500 && (
            <MovieRow title="Quattuornongentenary Design" movies={movies.slice(8500, 8520)} />
          )}
          {movies.length > 8520 && (
            <MovieRow title="Quinnongentenary Design" movies={movies.slice(8520, 8540)} />
          )}
          {movies.length > 8540 && (
            <MovieRow title="Sexnongentenary Design" movies={movies.slice(8540, 8560)} />
          )}
          {movies.length > 8560 && (
            <MovieRow title="Septennongentenary Design" movies={movies.slice(8560, 8580)} />
          )}
          {movies.length > 8580 && (
            <MovieRow title="Octonongentenary Design" movies={movies.slice(8580, 8600)} />
          )}
          {movies.length > 8600 && (
            <MovieRow title="Novemnongentenary Design" movies={movies.slice(8600, 8620)} />
          )}
          {movies.length > 8620 && (
            <MovieRow title="Millenary Design" movies={movies.slice(8620, 8640)} />
          )}
          {movies.length > 8640 && (
            <MovieRow title="Unmillenary Design" movies={movies.slice(8640, 8660)} />
          )}
          {movies.length > 8660 && (
            <MovieRow title="Duomillenary Design" movies={movies.slice(8660, 8680)} />
          )}
          {movies.length > 8680 && (
            <MovieRow title="Tremillenary Design" movies={movies.slice(8680, 8700)} />
          )}
          {movies.length > 8700 && (
            <MovieRow title="Quattuormillenary Design" movies={movies.slice(8700, 8720)} />
          )}
          {movies.length > 8720 && (
            <MovieRow title="Quinmillenary Design" movies={movies.slice(8720, 8740)} />
          )}
          {movies.length > 8740 && (
            <MovieRow title="Sexmillenary Design" movies={movies.slice(8740, 8760)} />
          )}
          {movies.length > 8760 && (
            <MovieRow title="Septenmillenary Design" movies={movies.slice(8760, 8780)} />
          )}
          {movies.length > 8780 && (
            <MovieRow title="Octomillenary Design" movies={movies.slice(8780, 8800)} />
          )}
          {movies.length > 8800 && (
            <MovieRow title="Novemmillenary Design" movies={movies.slice(8800, 8820)} />
          )}
          {movies.length > 8820 && (
            <MovieRow title="Duomillenary Design" movies={movies.slice(8820, 8840)} />
          )}
          {movies.length > 8840 && (
            <MovieRow title="Unduomillenary Design" movies={movies.slice(8840, 8860)} />
          )}
          {movies.length > 8860 && (
            <MovieRow title="Duoduomillenary Design" movies={movies.slice(8860, 8880)} />
          )}
          {movies.length > 8880 && (
            <MovieRow title="Troduomillenary Design" movies={movies.slice(8880, 8900)} />
          )}
          {movies.length > 8900 && (
            <MovieRow title="Quattuorduomillenary Design" movies={movies.slice(8900, 8920)} />
          )}
          {movies.length > 8920 && (
            <MovieRow title="Quinduomillenary Design" movies={movies.slice(8920, 8940)} />
          )}
          {movies.length > 8940 && (
            <MovieRow title="Sexduomillenary Design" movies={movies.slice(8940, 8960)} />
          )}
          {movies.length > 8960 && (
            <MovieRow title="Septenduomillenary Design" movies={movies.slice(8960, 8980)} />
          )}
          {movies.length > 8980 && (
            <MovieRow title="Octoduomillenary Design" movies={movies.slice(8980, 9000)} />
          )}
          {movies.length > 9000 && (
            <MovieRow title="Novemduomillenary Design" movies={movies.slice(9000, 9020)} />
          )}
          {movies.length > 9020 && (
            <MovieRow title="Treomillenary Design" movies={movies.slice(9020, 9040)} />
          )}
          {movies.length > 9040 && (
            <MovieRow title="Untreomillenary Design" movies={movies.slice(9040, 9060)} />
          )}
          {movies.length > 9060 && (
            <MovieRow title="Duotreomillenary Design" movies={movies.slice(9060, 9080)} />
          )}
          {movies.length > 9080 && (
            <MovieRow title="Tretreomillenary Design" movies={movies.slice(9080, 9100)} />
          )}
          {movies.length > 9100 && (
            <MovieRow title="Quattuortreomillenary Design" movies={movies.slice(9100, 9120)} />
          )}
          {movies.length > 9120 && (
            <MovieRow title="Quintreomillenary Design" movies={movies.slice(9120, 9140)} />
          )}
          {movies.length > 9140 && (
            <MovieRow title="Sextreomillenary Design" movies={movies.slice(9140, 9160)} />
          )}
          {movies.length > 9160 && (
            <MovieRow title="Septentreomillenary Design" movies={movies.slice(9160, 9180)} />
          )}
          {movies.length > 9180 && (
            <MovieRow title="Octotreomillenary Design" movies={movies.slice(9180, 9200)} />
          )}
          {movies.length > 9200 && (
            <MovieRow title="Novemtreomillenary Design" movies={movies.slice(9200, 9220)} />
          )}
          {movies.length > 9220 && (
            <MovieRow title="Quadringentomillenary Design" movies={movies.slice(9220, 9240)} />
          )}
          {movies.length > 9240 && (
            <MovieRow title="Unquadringentomillenary Design" movies={movies.slice(9240, 9260)} />
          )}
          {movies.length > 9260 && (
            <MovieRow title="Duoquadringentomillenary Design" movies={movies.slice(9260, 9280)} />
          )}
          {movies.length > 9280 && (
            <MovieRow title="Trequadringentomillenary Design" movies={movies.slice(9280, 9300)} />
          )}
          {movies.length > 9300 && (
            <MovieRow title="Quattuorquadringentomillenary Design" movies={movies.slice(9300, 9320)} />
          )}
          {movies.length > 9320 && (
            <MovieRow title="Quinquadringentomillenary Design" movies={movies.slice(9320, 9340)} />
          )}
          {movies.length > 9340 && (
            <MovieRow title="Sexquadringentomillenary Design" movies={movies.slice(9340, 9360)} />
          )}
          {movies.length > 9360 && (
            <MovieRow title="Septenquadringentomillenary Design" movies={movies.slice(9360, 9380)} />
          )}
          {movies.length > 9380 && (
            <MovieRow title="Octoquadringentomillenary Design" movies={movies.slice(9380, 9400)} />
          )}
          {movies.length > 9400 && (
            <MovieRow title="Novemquadringentomillenary Design" movies={movies.slice(9400, 9420)} />
          )}
          {movies.length > 9420 && (
            <MovieRow title="Quingentomillenary Design" movies={movies.slice(9420, 9440)} />
          )}
          {movies.length > 9440 && (
            <MovieRow title="Unquingentomillenary Design" movies={movies.slice(9440, 9460)} />
          )}
          {movies.length > 9460 && (
            <MovieRow title="Duoquingentomillenary Design" movies={movies.slice(9460, 9480)} />
          )}
          {movies.length > 9480 && (
            <MovieRow title="Trequingentomillenary Design" movies={movies.slice(9480, 9500)} />
          )}
          {movies.length > 9500 && (
            <MovieRow title="Quattuorquingentomillenary Design" movies={movies.slice(9500, 9520)} />
          )}
          {movies.length > 9520 && (
            <MovieRow title="Quinquingentomillenary Design" movies={movies.slice(9520, 9540)} />
          )}
          {movies.length > 9540 && (
            <MovieRow title="Sexquingentomillenary Design" movies={movies.slice(9540, 9560)} />
          )}
          {movies.length > 9560 && (
            <MovieRow title="Septenquingentomillenary Design" movies={movies.slice(9560, 9580)} />
          )}
          {movies.length > 9580 && (
            <MovieRow title="Octoquingentomillenary Design" movies={movies.slice(9580, 9600)} />
          )}
          {movies.length > 9600 && (
            <MovieRow title="Novemquingentomillenary Design" movies={movies.slice(9600, 9620)} />
          )}
          {movies.length > 9620 && (
            <MovieRow title="Sescentomillenary Design" movies={movies.slice(9620, 9640)} />
          )}
          {movies.length > 9640 && (
            <MovieRow title="Unsescentomillenary Design" movies={movies.slice(9640, 9660)} />
          )}
          {movies.length > 9660 && (
            <MovieRow title="Duosescentomillenary Design" movies={movies.slice(9660, 9680)} />
          )}
          {movies.length > 9680 && (
            <MovieRow title="Tresescentomillenary Design" movies={movies.slice(9680, 9700)} />
          )}
          {movies.length > 9700 && (
            <MovieRow title="Quattuorsescentomillenary Design" movies={movies.slice(9700, 9720)} />
          )}
          {movies.length > 9720 && (
            <MovieRow title="Quinsescentomillenary Design" movies={movies.slice(9720, 9740)} />
          )}
          {movies.length > 9740 && (
            <MovieRow title="Sexsescentomillenary Design" movies={movies.slice(9740, 9760)} />
          )}
          {movies.length > 9760 && (
            <MovieRow title="Septensescentomillenary Design" movies={movies.slice(9760, 9780)} />
          )}
          {movies.length > 9780 && (
            <MovieRow title="Octosescentomillenary Design" movies={movies.slice(9780, 9800)} />
          )}
          {movies.length > 9800 && (
            <MovieRow title="Novemsescentomillenary Design" movies={movies.slice(9800, 9820)} />
          )}
          {movies.length > 9820 && (
            <MovieRow title="Septingentomillenary Design" movies={movies.slice(9820, 9840)} />
          )}
          {movies.length > 9840 && (
            <MovieRow title="Unseptingentomillenary Design" movies={movies.slice(9840, 9860)} />
          )}
          {movies.length > 9860 && (
            <MovieRow title="Duoseptingentomillenary Design" movies={movies.slice(9860, 9880)} />
          )}
          {movies.length > 9880 && (
            <MovieRow title="Treseptingentomillenary Design" movies={movies.slice(9880, 9900)} />
          )}
          {movies.length > 9900 && (
            <MovieRow title="Quattuorseptingentomillenary Design" movies={movies.slice(9900, 9920)} />
          )}
          {movies.length > 9920 && (
            <MovieRow title="Quinseptingentomillenary Design" movies={movies.slice(9920, 9940)} />
          )}
          {movies.length > 9940 && (
            <MovieRow title="Sexseptingentomillenary Design" movies={movies.slice(9940, 9960)} />
          )}
          {movies.length > 9960 && (
            <MovieRow title="Septenseptingentomillenary Design" movies={movies.slice(9960, 9980)} />
          )}
          {movies.length > 9980 && (
            <MovieRow title="Octoseptingentomillenary Design" movies={movies.slice(9980, 10000)} />
          )}
          {movies.length > 10000 && (
            <MovieRow title="Novemseptingentomillenary Design" movies={movies.slice(10000, 10020)} />
          )}
          {movies.length > 10020 && (
            <MovieRow title="Octingentomillenary Design" movies={movies.slice(10020, 10040)} />
          )}
          {movies.length > 10040 && (
            <MovieRow title="Unoctingentomillenary Design" movies={movies.slice(10040, 10060)} />
          )}
          {movies.length > 10060 && (
            <MovieRow title="Duooctingentomillenary Design" movies={movies.slice(10060, 10080)} />
          )}
          {movies.length > 10080 && (
            <MovieRow title="Treoctingentomillenary Design" movies={movies.slice(10080, 10100)} />
          )}
          {movies.length > 10100 && (
            <MovieRow title="Quattuoroctingentomillenary Design" movies={movies.slice(10100, 10120)} />
          )}
          {movies.length > 10120 && (
            <MovieRow title="Quinoctingentomillenary Design" movies={movies.slice(10120, 10140)} />
          )}
          {movies.length > 10140 && (
            <MovieRow title="Sexoctingentomillenary Design" movies={movies.slice(10140, 10160)} />
          )}
          {movies.length > 10160 && (
            <MovieRow title="Septenoctingentomillenary Design" movies={movies.slice(10160, 10178)} />
          )}
          
          {!hasMore && movies.length > 0 && (
            <div className="end-indicator">
              <p>You've reached the end! 🎬</p>
              <p>Enjoy exploring all {movies.length} movies!</p>
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

  const fetchMovieAndRecommendations = useCallback(async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
      const movieRes = await fetch(`${apiUrl}/movies/${movieId}`);
      const movieData = await movieRes.json();
      setMovie(movieData);

      const recRes = await fetch(`${apiUrl}/recommendations/${movieId}`);
      const recData = await recRes.json();
      setRecommendations(recData.recommendations || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieAndRecommendations();
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId, fetchMovieAndRecommendations]);

  const getSimilarityColor = (score) => {
    if (score >= 0.8) return '#4ade80'; // Green
    if (score >= 0.6) return '#fbbf24'; // Yellow
    if (score >= 0.4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getSimilarityLabel = (score) => {
    if (score >= 0.8) return 'Very Similar';
    if (score >= 0.6) return 'Similar';
    if (score >= 0.4) return 'Somewhat Similar';
    return 'Loosely Related';
  };

  const RecommendationCard = ({ rec, index }) => {
    const similarityPercentage = (rec.score * 100).toFixed(1);
    const similarityColor = getSimilarityColor(rec.score);
    const similarityLabel = getSimilarityLabel(rec.score);

    return (
      <div className="rec-card" onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/recommendations/${rec.id}`);
      }}>
        <div className="rec-rank">
          <span className="rank-number">#{index + 1}</span>
        </div>
        
        <div className="rec-poster">
          {rec.poster_url ? (
            <img 
              src={rec.poster_url} 
              alt={rec.title}
              className="rec-poster-image"
              onError={(e) => {
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
          
          <div className="similarity-section">
            <div className="similarity-header">
              <span className="similarity-label">{similarityLabel}</span>
              <span className="similarity-percentage">{similarityPercentage}%</span>
            </div>
            <div className="similarity-bar">
              <div 
                className="similarity-fill" 
                style={{ 
                  width: `${similarityPercentage}%`,
                  backgroundColor: similarityColor
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rec-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Analyzing movie patterns...</h2>
          <p>Finding the most similar movies using AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      {/* Movie Hero Section */}
      <div className="movie-hero">
        <div className="hero-backdrop">
          {movie?.poster_url && (
            <img 
              src={movie.poster_url} 
              alt={movie.title}
              className="backdrop-image"
            />
          )}
          <div className="backdrop-overlay"></div>
        </div>
        
        <div className="hero-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Movies
          </button>
          
          <div className="movie-details">
            <div className="movie-poster-large">
              {movie?.poster_url ? (
                <img 
                  src={movie.poster_url} 
                  alt={movie.title}
                  className="poster-large-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="poster-large-placeholder" style={{ display: movie?.poster_url ? 'none' : 'flex' }}>
                <span className="poster-large-title">{movie?.title}</span>
              </div>
            </div>
            
            <div className="movie-info">
              <h1 className="movie-title">{movie?.title}</h1>
              <p className="movie-description">{movie?.description}</p>
              <div className="ai-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                AI-Powered Recommendations
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="recommendations-section">
        <div className="section-header">
          <h2>Similar Movies</h2>
          <p>Based on AI analysis of content, themes, and patterns</p>
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

// Header Component (inside Router context)
function AppHeader({ searchQuery, setSearchQuery, isInfoPanelOpen, setIsInfoPanelOpen, onSearch }) {
  const navigate = useNavigate();
  const [searchTimeout, setSearchTimeout] = useState(null);

  const debouncedSearch = (query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <header className="smartflix-header">
      <div className="header-left">
        <div className="smartflix-logo">
          <span className="logo-text">SMARTFLIX</span>
        </div>
        <nav className="header-nav">
          <button 
            className="nav-link"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
          >
            Home
          </button>
          <a 
            href="/shahene_chaouachi_resume.pdf" 
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            TV Shows
          </a>
          <a 
            href="/shahene_chaouachi_resume.pdf" 
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Movies
          </a>
          <a 
            href="/shahene_chaouachi_resume.pdf" 
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            New & Popular
          </a>
          <a 
            href="/shahene_chaouachi_resume.pdf" 
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            My List
          </a>
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
              debouncedSearch(e.target.value);
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
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Scroll to search results when they appear
  useEffect(() => {
    if (searchQuery && searchResults.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const searchResultsElement = document.querySelector('.search-results');
        if (searchResultsElement) {
          searchResultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  }, [searchQuery, searchResults]);

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
        <AppHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isInfoPanelOpen={isInfoPanelOpen}
          setIsInfoPanelOpen={setIsInfoPanelOpen}
          onSearch={handleSearch}
        />

        {/* Search Results */}
        {searchQuery && (
          <div className="search-results">
            <h2>Search Results</h2>
            {isSearching ? (
              <div className="search-loading">Searching...</div>
            ) : (
              <div className="search-grid">
                {searchResults.map(movie => (
                  <div key={movie.id} className="movie-card" onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.location.href = `/recommendations/${movie.id}`;
                  }}>
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

