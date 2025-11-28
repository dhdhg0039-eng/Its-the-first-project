const fetch = require('node-fetch');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'articles.json');
const BRANDS_FILE = path.join(__dirname, '..', 'docs', 'brands.json');

const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

async function fetchRSS(url) {
  try {
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) return [];
    const text = await res.text();
    const xml = await parser.parseStringPromise(text);
    const items = xml.rss?.channel?.item || xml.feed?.entry || [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.map(item => ({
      title: item.title && item.title._ ? item.title._ : (item.title || ''),
      description: (item.description && item.description._) || item.description || item.summary || '',
      url: item.link && item.link.href ? item.link.href : (item.link || ''),
      pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
      source: new URL(url).hostname
    }));
  } catch (e) {
    console.warn('RSS fetch failed', url, e.message);
    return [];
  }
}

async function fetchHackerNews() {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
    if (!res.ok) return [];
    const ids = await res.json();
    const slice = ids.slice(0, 60);
    const prom = slice.map(async id => {
      try {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!r.ok) return null;
        const story = await r.json();
        return {
          title: story.title || '',
          description: '',
          url: story.url || `https://news.ycombinator.com/item?id=${id}`,
          pubDate: story.time ? new Date(story.time * 1000).toISOString() : new Date().toISOString(),
          source: 'Hacker News'
        };
      } catch (e) { return null; }
    });
    const resArr = await Promise.all(prom);
    return resArr.filter(Boolean);
  } catch (e) {
    console.warn('HN fetch error', e.message);
    return [];
  }
}

function detectBrands(text, brands) {
  if (!text || !brands) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const b of brands) {
    try { if (lower.includes(b.toLowerCase())) { if (!found.includes(b)) found.push(b); } } catch (e) {}
  }
  return found;
}

function sourceWeight(source) {
  const weights = {
    'thespiritsbusiness.com': 1.0,
    'thedrinksbusiness.com': 1.0,
    'liquor.com': 1.0,
    'vinepair.com': 1.0,
    'punchdrink.com': 0.9,
    'bloomberg.com': 0.9,
    'cnbc.com': 0.8,
    'hacker news': 0.4
  };
  if (!source) return 0.6;
  const s = source.toLowerCase();
  for (const key of Object.keys(weights)) if (s.includes(key)) return weights[key];
  return 0.6;
}

async function runFetchAndStore() {
  const feeds = [
    'https://www.thespiritsbusiness.com/feed/',
    'https://www.thedrinksbusiness.com/feed/',
    'https://www.liquor.com/feed/',
    'https://vinepair.com/feed/',
    'https://punchdrink.com/feed/',
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html'
  ];

  const rssPromises = feeds.map(f => fetchRSS(f));
  const hnPromise = fetchHackerNews();

  const results = await Promise.all([...rssPromises, hnPromise]);
  let all = results.flat();

  // dedupe by title+url
  const seen = new Set();
  all = all.filter(a => {
    const key = (a.title || '') + '|' + (a.url || '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // load brands
  let brands = [];
  try { brands = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8') || '[]'); } catch (e) { brands = []; }

  const now = Date.now();
  all.forEach(a => {
    a.brands = detectBrands((a.title || '') + ' ' + (a.description || ''), brands);
    a.mentionCount = (a.brands || []).length;
    const days = Math.max(0, (now - new Date(a.pubDate || now).getTime()) / (1000 * 60 * 60 * 24));
    const recency = Math.max(0, 1 - (days / 7));
    const mentionScore = Math.min(1, a.mentionCount / 4);
    const sourceScore = sourceWeight(a.source || '');
    a.score = (recency * 0.5) + (mentionScore * 0.3) + (sourceScore * 0.2);
  });

  // filter to liquor keywords
  const liquorRegex = /(beer|wine|whiskey|bourbon|gin|vodka|rum|tequila|spirits|distillery|brewery|cocktail|mixology|sommelier|alcohol|liquor|rtd|seltzer|hard seltzer)/i;
  all = all.filter(a => liquorRegex.test((a.title || '') + ' ' + (a.description || '') + ' ' + (a.source || '')));

  // sort by score then recency
  all.sort((a,b) => (b.score || 0) - (a.score || 0));

  // write to file
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf8');
  } catch (e) {
    console.error('Write data error', e.message);
  }

  return all;
}

module.exports = { runFetchAndStore };
