# Movie Poster Scripts

This directory contains scripts to add movie posters to your Smartflix application.

## Scripts Available

### 1. `addPlaceholderPosters.js` ✅ (Already Run)
- **Purpose**: Adds placeholder poster URLs to all movies for immediate testing
- **Usage**: `node scripts/addPlaceholderPosters.js`
- **Result**: All movies now have placeholder poster URLs that display movie title and year

### 2. `fetchMoviePosters.js` (Optional - For Real Posters)
- **Purpose**: Fetches real movie posters from The Movie Database (TMDB) API
- **Requirements**: 
  - Free TMDB API key from https://www.themoviedb.org/settings/api
  - Update the `TMDB_API_KEY` variable in the script
- **Usage**: 
  - `node scripts/fetchMoviePosters.js` (full update)
  - `node scripts/fetchMoviePosters.js --test` (test with first 5 movies)
- **Features**:
  - Respects API rate limits (40 requests per 10 seconds)
  - Saves progress every 100 movies
  - Handles errors gracefully
  - Provides detailed logging

## Getting a TMDB API Key (Free)

1. Go to https://www.themoviedb.org/settings/api
2. Create a free account
3. Request an API key (usually approved immediately)
4. Copy your API key
5. Update the `TMDB_API_KEY` variable in `fetchMoviePosters.js`

## Current Status

✅ **Placeholder posters are now active!** Your Smartflix app should display placeholder posters for all movies.

## Next Steps (Optional)

If you want to upgrade to real movie posters:

1. Get a free TMDB API key
2. Update the API key in `fetchMoviePosters.js`
3. Run: `node scripts/fetchMoviePosters.js --test` (to test with 5 movies first)
4. If successful, run: `node scripts/fetchMoviePosters.js` (to update all movies)

## Features Added

- ✅ Movie posters display in all movie cards
- ✅ Recommendation posters display in recommendation cards
- ✅ Selected movie poster displays in recommendations page
- ✅ Search result posters display in search results
- ✅ Fallback handling for missing or broken poster URLs
- ✅ Smooth hover animations and transitions
- ✅ Responsive design for all screen sizes

Your Smartflix app now has a much more visual and engaging interface with movie posters!
