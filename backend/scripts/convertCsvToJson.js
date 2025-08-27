import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = [];

const inputPath = path.join(__dirname, '../data/imdb_movies.csv');
const outputPath = path.join(__dirname, '../data/movies.json');

fs.createReadStream(inputPath)
  .pipe(csv())
  .on('data', (row) => {
    const { names, overview, genre, date_x } = row;

    if (!names || !overview) return;

    // Extract year from date_x (format: MM/DD/YYYY)
    let year = null;
    if (date_x) {
      const yearMatch = date_x.trim().match(/\d{4}$/);
      if (yearMatch) year = parseInt(yearMatch[0]);
    }

    results.push({
      id: crypto.randomUUID(),
      title: names.trim(),
      description: overview.trim(),
      genre: genre?.trim() || '',
      year: year
    });
  })
  .on('end', () => {

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`✅ Converted ${results.length} movies to JSON`);
  });
  
