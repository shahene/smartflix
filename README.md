# 🎬 Smartflix

A smart, Netflix-style movie recommendation engine built with OpenAI embeddings and Weaviate vector search.

Inspired by [Andrej Karpathy's weekend project](https://twitter.com/karpathy/status/1647075682258069504)

---

## 🔥 Features

- 🔎 Search movies (keyword, semantic, hybrid)
- 🎯 Get recommendations for any movie
- 🧠 Powered by OpenAI's `text-embedding-ada-002`
- ⚡️ Uses Weaviate vector DB for fast semantic queries
- 🎨 Custom Netflix-style UI with scrollable carousels

---

## 🧠 How it Works

1. Movie descriptions + plots are vectorized using OpenAI embeddings.
2. Vectors are stored in a Weaviate DB.
3. Search supports:
   - 🔤 BM25 keyword search
   - 🧠 Semantic vector search
   - ⚖️ Hybrid (both)
4. Recommendations are based on nearest neighbors in vector space.

---

## 🏗️ Tech Stack

| Layer        | Tech                        |
|--------------|-----------------------------|
| Frontend     | React + Tailwind CSS  |
| Backend      | Node.js
| Embeddings   | OpenAI `text-embedding-ada-002` |
| Vector DB    | Weaviate                    |
| Data         | Kaggle + Wikipedia datasets |
| Deployment   | Vercel + Docker             |

---


