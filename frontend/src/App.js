import { useEffect, useState } from 'react';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data.movies))
      .catch(err => console.error('Failed to fetch movies:', err));
  }, []);

  const handleClick = async (movie) => {
    setSelectedMovie(movie);
    setLoadingRecs(true);
    try {
      const res = await fetch(`http://localhost:3001/api/recommendations/${movie.id}`);
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setRecommendations([]);
    }
    setLoadingRecs(false);
  };

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Smartflix</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 20
      }}>
        {movies.map(movie => (
          <div
            key={movie.id}
            onClick={() => handleClick(movie)}
            style={{
              cursor: 'pointer',
              backgroundColor: '#222',
              padding: 10,
              borderRadius: 8,
              userSelect: 'none'
            }}
          >
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>

      {selectedMovie && (
  <div style={{ marginTop: 40, padding: 20, backgroundColor: '#222', borderRadius: 8 }}>
    <h2>Recommendations for {selectedMovie.title}</h2>
    {loadingRecs && <p>Loading recommendations...</p>}
    {!loadingRecs && (!recommendations || recommendations.length === 0) && <p>No recommendations found.</p>}
    <ul>
      {recommendations && recommendations.map((rec) => (
        <li key={rec.id} style={{ marginBottom: 8 }}>
          {rec.title}
        </li>
      ))}
    </ul>
    <button
      onClick={() => {
        setSelectedMovie(null);
        setRecommendations([]);
      }}
      style={{
        marginTop: 10,
        padding: '6px 12px',
        backgroundColor: '#444',
        border: 'none',
        borderRadius: 4,
        color: '#fff',
        cursor: 'pointer'
      }}
    >
      Close
    </button>
  </div>
)}

    </div>
  );
}
