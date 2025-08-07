// backend/server.js (or index.js)
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Load movies into memory
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/movies.json'), 'utf-8'));

// Setup Pinecone
const pinecone = new Pinecone({ 
  apiKey: process.env.PINECONE_API_KEY
});
const index = pinecone.index('intelligent-movies');

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smartflix API is running!' });
});

// Get all movies with pagination
app.get('/api/movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedMovies = movies.slice(start, end).map(({ id, title }) => ({ id, title }));
  res.json({
    page,
    limit,
    total: movies.length,
    movies: paginatedMovies
  });
});

// Get movie by ID
app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// Search movies
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    
    // Truncate to 1024 dimensions to match your index
    const truncatedEmbedding = embedding.data[0].embedding.slice(0, 1024);
    
    const queryResponse = await index.query({
      vector: truncatedEmbedding,
      topK: 10,
      includeMetadata: true
    });
    
    const results = queryResponse.matches.map(match => ({
      id: match.id,
      title: match.metadata.title,
      description: match.metadata.description,
      score: match.score
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get similar movies (recommendations)
app.get('/api/recommendations/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    console.log(`🎯 Fetching recommendations for movie ID: ${movieId}`);
    
    // Get the movie to find similar ones
    console.log('📥 Fetching movie vector from Pinecone...');
    const movie = await index.fetch([movieId]);
    console.log('📊 Pinecone fetch response:', JSON.stringify(movie, null, 2));
    
    if (!movie.records[movieId]) {
      console.log(`❌ Movie ID ${movieId} not found in Pinecone`);
      return res.status(404).json({ error: 'Movie not found in vector database' });
    }
    
    console.log(`✅ Found movie vector for ID ${movieId}`);
    console.log(`📏 Vector dimensions: ${movie.records[movieId].values.length}`);
    
    // Find similar movies
    console.log('🔍 Querying for similar movies...');
    const queryResponse = await index.query({
      vector: movie.records[movieId].values,
      topK: 20,
      includeMetadata: true
    });
    
    console.log('📊 Query response:', JSON.stringify(queryResponse, null, 2));
    
    const recommendations = queryResponse.matches
      .filter(match => match.id !== movieId)
      .map(match => ({
        id: match.id,
        title: match.metadata.title,
        description: match.metadata.description,
        score: match.score
      }));
    
    console.log(`🎉 Found ${recommendations.length} recommendations`);
    console.log('📋 Recommendations:', recommendations);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Debug endpoint to check Pinecone data
app.get('/api/debug/pinecone', async (req, res) => {
  try {
    console.log('🔍 Debugging Pinecone data...');
    
    // Get first few movies from local data
    const firstMovies = movies.slice(0, 5);
    console.log('📋 First 5 movies from local data:', firstMovies.map(m => ({ id: m.id, title: m.title })));
    
    // Try to fetch these movies from Pinecone
    const movieIds = firstMovies.map(m => m.id);
    console.log('🎯 Trying to fetch from Pinecone:', movieIds);
    
    const fetchResponse = await index.fetch(movieIds);
    console.log('📊 Pinecone fetch response:', JSON.stringify(fetchResponse, null, 2));
    
    res.json({
      localMovies: firstMovies,
      pineconeResponse: fetchResponse,
      message: 'Check server logs for detailed debugging info'
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎬 Smartflix backend running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});
