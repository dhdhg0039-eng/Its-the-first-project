# Beverage Brain - Server

This is a lightweight Node.js crawler + API to fetch beverage industry news, detect brands, score articles, and serve them as JSON for the frontend.

Quick start (local):

1. Install dependencies

```bash
cd server
npm install
```

2. Run the server

```bash
npm start
```

The server will fetch articles on startup and every 30 minutes, saving them to `server/data/articles.json`.

Endpoints:
- `GET /api/articles` - returns cached articles
- `GET /api/brands` - returns aggregated brand counts
- `POST /_fetch` - trigger a fetch immediately (optional `X-FETCH-TOKEN` header if `FETCH_TOKEN` env var is set)

Deploy:
- You can deploy `server/` to Render, Heroku, or a small VPS. Make sure to set `FETCH_TOKEN` if you want to secure the manual trigger endpoint.

Notes:
- The fetcher currently uses public RSS feeds and Hacker News. For full coverage, add more feeds and API keys (NewsAPI, Guardian API with proper key).
- The frontend in `/docs` can be adapted to call `/api/articles` instead of local aggregators for more reliable data and to avoid CORS/rate limits.
