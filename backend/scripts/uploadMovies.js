import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index('smartflix-movies');

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const moviesPath = path.join(__dirname, '../data/movies.json');
  const raw = fs.readFileSync(moviesPath, 'utf-8');
  const movies = JSON.parse(raw);

  const vectors = [];

  console.log(` Processing ${movies.length} movies...`);

  for (const movie of movies) {
    const input = `${movie.title}. ${movie.description}`;
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input
    });

    // Truncate to 1024 dimensions to match your index
    const truncatedEmbedding = embedding.data[0].embedding.slice(0, 1024);

    vectors.push({
      id: movie.id,
      values: truncatedEmbedding,
      metadata: {
        title: movie.title,
        description: movie.description
      }
    });
    
    // Log the first few IDs to see what we're uploading
    if (vectors.length <= 5) {
      console.log(`📝 Uploading movie ID: ${movie.id} - ${movie.title}`);
    }
    
    if (vectors.length % 10 === 0) {
      console.log(`✅ Processed ${vectors.length} movies...`);
    }
  }

  console.log(' Uploading vectors to Pinecone...');
  const BATCH_SIZE = 100;

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
    console.log(`✅ Uploaded batch ${Math.floor(i/BATCH_SIZE) + 1} (${batch.length} movies)...`);
  }

  console.log('✅ Uploaded all movie vectors to Pinecone.');
  console.log('🎯 Sample movie IDs uploaded:', vectors.slice(0, 3).map(v => v.id));
}

main().catch(err => console.error('❌ Error:', err));
