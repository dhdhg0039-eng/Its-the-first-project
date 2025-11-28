const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetcher = require('./fetcher');

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// serve simple health
app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// articles API
app.get('/api/articles', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    res.json({ articles: data, lastUpdate: fs.statSync(DATA_FILE).mtime });
  } catch (e) {
    res.json({ articles: [], lastUpdate: null, error: e.message });
  }
});

// brands API
app.get('/api/brands', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    const counts = {};
    data.forEach(a => {
      (a.brands || []).forEach(b => { counts[b] = (counts[b] || 0) + 1; });
    });
    res.json({ brands: counts });
  } catch (e) {
    res.json({ brands: {} });
  }
});

// trigger fetch (protected by simple token if provided)
app.post('/_fetch', async (req, res) => {
  const token = process.env.FETCH_TOKEN;
  if (token && req.headers['x-fetch-token'] !== token) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const results = await fetcher.runFetchAndStore();
    res.json({ ok: true, count: results.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Start scheduled fetch every 30 minutes
(async () => {
  // ensure data dir
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // initial fetch on startup
  try { await fetcher.runFetchAndStore(); } catch (e) { console.warn('Initial fetch failed', e.message); }

  // schedule
  setInterval(() => {
    fetcher.runFetchAndStore().catch(err => console.error('Scheduled fetch error', err));
  }, 30 * 60 * 1000);

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})();
