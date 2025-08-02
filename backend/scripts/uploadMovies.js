import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index('intelligent-movies');

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

    const fullEmbedding = embedding.data[0].embedding

    vectors.push({
      id: movie.id,
      values: fullEmbedding,
      metadata: {
        title: movie.title,
        description: movie.description
      }
    });

    if (vectors.length % 10 === 0) {
      console.log(`✅ Processed ${vectors.length} movies...`);
    }
  }

  console.log(' Uploading vectors to Pinecone...');
  await index.upsert(vectors);
  console.log('✅ Uploaded all movie vectors to Pinecone.');
}

main().catch(err => console.error('❌ Error:', err));
