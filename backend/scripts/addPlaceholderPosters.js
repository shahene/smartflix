// Script to add placeholder poster URLs to movies.json for testing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load existing movies
const moviesPath = path.join(__dirname, '../data/movies.json');
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'));

// Function to generate a placeholder poster URL
function generatePlaceholderPoster(title, year) {
  // Using a placeholder service that generates movie-style posters
  const encodedTitle = encodeURIComponent(title);
  const encodedYear = encodeURIComponent(year);
  
  // Using placeholder.com with movie poster dimensions (500x750)
  return `https://via.placeholder.com/500x750/1a1a1a/ffffff?text=${encodedTitle}+(${encodedYear})`;
}

// Function to add poster URLs to movies
function addPosterUrls() {
  console.log(`🎬 Adding poster URLs to ${movies.length} movies...`);
  
  let updatedCount = 0;
  
  movies.forEach((movie, index) => {
    // Skip if poster already exists
    if (movie.poster_url) {
      console.log(`⏭️  Skipping "${movie.title}" - already has poster`);
      return;
    }
    
    // Generate placeholder poster URL
    movie.poster_url = generatePlaceholderPoster(movie.title, movie.year);
    updatedCount++;
    
    if ((index + 1) % 100 === 0) {
      console.log(`📝 Processed ${index + 1}/${movies.length} movies...`);
    }
  });
  
  // Save updated movies
  fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2));
  
  console.log(`\n🎉 Completed!`);
  console.log(`✅ Added poster URLs to ${updatedCount} movies`);
  console.log(`📁 Updated movies.json with poster URLs`);
}

// Run the script
addPosterUrls();
