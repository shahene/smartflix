# 🚀 Smartflix Deployment Guide

## Quick Deploy to Vercel (Easiest Method)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
cd /Users/shahene/Projects/smartflix
vercel
```

**When Vercel asks "Which directory is your code located in?", answer:**
```
./
```
(Just press Enter - it should default to the current directory)

### 4. Set Environment Variables
In your Vercel dashboard, go to your project settings and add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
```

### 5. Redeploy
```bash
vercel --prod
```

## Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will auto-deploy on every push

## What This Setup Does

- **Frontend**: Serves your React app
- **Backend**: Runs your Node.js API on Vercel's serverless functions
- **API Routes**: All `/api/*` requests go to your backend
- **Static Files**: Your resume PDF and other assets are served

## Production URLs

- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## Troubleshooting

- Make sure all environment variables are set in Vercel dashboard
- Check Vercel function logs if API calls fail
- Ensure your Pinecone index is accessible from production

Your Smartflix app will be live at your Vercel URL! 🎬✨
