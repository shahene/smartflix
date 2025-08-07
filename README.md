# Smartflix

Smartflix is a Netflix-style movie recommendation engine that leverages OpenAI’s powerful text embeddings combined with a vector search database to deliver fast, relevant, and semantic movie recommendations.

Inspired by Andrej Karpathy's weekend project, Smartflix aims to provide users with an intuitive interface to search and discover movies based on both keyword and semantic similarity.

---

## Features

- Semantic and keyword-based movie search: Find movies using natural language queries or traditional keyword matching.
- Movie recommendations: Get personalized recommendations based on any selected movie using vector similarity.
- Powered by OpenAI embeddings: Uses the `text-embedding-ada-002` model to convert movie descriptions and plots into vector representations.
- Vector search backend: Stores and queries vectors efficiently using Pinecone, a managed vector database.
- Custom Netflix-style UI: Scrollable carousels and a clean interface to browse and discover movies easily.

---

## How It Works

1. **Data vectorization:** Movie titles and descriptions are converted into high-dimensional vectors using OpenAI embeddings.
2. **Vector storage:** These vectors are stored in Pinecone’s vector database for efficient similarity search.
3. **Search capabilities:** Supports multiple search modes:
   - Traditional keyword search (BM25).
   - Semantic search leveraging vector similarity.
   - Hybrid search combining both methods.
4. **Recommendation engine:** Finds the nearest neighbors to a given movie vector to provide relevant recommendations.

---

## Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | React, Tailwind CSS           |
| Backend     | Node.js                      |
| Embeddings  | OpenAI text-embedding-ada-002 |
| Vector DB   | Pinecone                     |
| Data        | Kaggle movie dataset, Wikipedia |
| Deployment  | Vercel, Docker               |

---

## Getting Started

*Instructions to set up the project locally, install dependencies, configure environment variables (OpenAI and Pinecone API keys), and run the backend and frontend.*

---

## About

Smartflix demonstrates the potential of combining modern NLP embeddings with vector search databases to build scalable, intelligent recommendation systems. This project is both a technical exploration and a portfolio piece illustrating real-world use of AI APIs.
