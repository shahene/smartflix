// Script to fetch movie posters from TMDB API and add them to movies.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TMDB API configuration
const TMDB_API_KEY = '21ae2f5343343ba2ea3b037fb4f34ded'; // You'll need to get this from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // w500 for medium quality posters

// Load existing movies
const moviesPath = path.join(__dirname, '../data/movies.json');
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));

// Function to search for movie on TMDB
async function searchMovieOnTMDB(title, year) {
  try {
    const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Return the first result (most relevant)
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error(`Error searching for "${title}":`, error.message);
    return null;
  }
}

// Function to get movie details including poster
async function getMoviePoster(movie) {
  try {
    console.log(`🔍 Searching for poster: ${movie.title} (${movie.year})`);
    
    // Search for the movie
    const tmdbMovie = await searchMovieOnTMDB(movie.title, movie.year);
    
    if (tmdbMovie && tmdbMovie.poster_path) {
      const posterUrl = `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}`;
      console.log(`✅ Found poster for "${movie.title}": ${posterUrl}`);
      return posterUrl;
    } else {
      console.log(`❌ No poster found for "${movie.title}"`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting poster for "${movie.title}":`, error.message);
    return null;
  }
}

// Main function to update movies with posters
async function updateMoviesWithPosters() {
  console.log(`🎬 Starting to fetch posters for ${movies.length} movies...`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    
    // Skip if poster already exists and it's not a placeholder
    if (movie.poster_url && !movie.poster_url.includes('via.placeholder.com')) {
      console.log(`⏭️  Skipping "${movie.title}" - already has real poster`);
      continue;
    }
    
    // Add delay to respect API rate limits (40 requests per 10 seconds)
    if (i > 0 && i % 40 === 0) {
      console.log('⏳ Waiting 10 seconds to respect API rate limits...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    const posterUrl = await getMoviePoster(movie);
    
    if (posterUrl) {
      movie.poster_url = posterUrl;
      updatedCount++;
    } else {
      errorCount++;
    }
    
    // Save progress every 100 movies
    if ((i + 1) % 100 === 0) {
      console.log(`💾 Saving progress... (${i + 1}/${movies.length} processed)`);
      fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2));
    }
  }
  
  // Final save
  fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2));
  
  console.log(`\n🎉 Completed!`);
  console.log(`✅ Successfully updated: ${updatedCount} movies`);
  console.log(`❌ Failed to find posters: ${errorCount} movies`);
  console.log(`📁 Updated movies.json with poster URLs`);
}

// Function to create a sample with just a few movies for testing
async function testWithSampleMovies() {
  console.log('🧪 Testing with first 5 movies...');
  
  const sampleMovies = movies.slice(0, 5);
  
  for (const movie of sampleMovies) {
    // Replace placeholder with real poster
    const posterUrl = await getMoviePoster(movie);
    if (posterUrl) {
      movie.poster_url = posterUrl;
    }
  }
  
  // Save the sample
  const samplePath = path.join(__dirname, '../data/movies_sample_with_posters.json');
  fs.writeFileSync(samplePath, JSON.stringify(sampleMovies, null, 2));
  
  console.log('✅ Sample created with posters!');
  console.log(`📁 Check: ${samplePath}`);
}

// Check if API key is set
if (TMDB_API_KEY === 'your_tmdb_api_key_here') {
  console.log('❌ Please set your TMDB API key in the script!');
  console.log('📝 Get your free API key from: https://www.themoviedb.org/settings/api');
  console.log('🔧 Then update the TMDB_API_KEY variable in this script');
  process.exit(1);
}

// Run the script
const args = process.argv.slice(2);
if (args.includes('--test')) {
  testWithSampleMovies();
} else {
  updateMoviesWithPosters();
}
