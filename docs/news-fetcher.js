// News fetcher from multiple real sources
class NewsFetcher {
  constructor() {
    this.articles = [];
    this.cache = JSON.parse(localStorage.getItem('news_cache') || '[]');
    this.lastUpdate = localStorage.getItem('news_lastUpdate') || null;
    this.brands = []; // will be loaded from brands.json
  }

  // Source weighting to prefer trade and beverage-specific outlets
  sourceWeight(source) {
    const weights = {
      'theguardian.com': 0.6,
      'guardian.co.uk': 0.6,
      'bloomberg.com': 0.9,
      'cnbc.com': 0.8,
      'thespiritsbusiness.com': 1.0,
      'thedrinksbusiness.com': 1.0,
      'liquor.com': 1.0,
      'vinepair.com': 1.0,
      'punchdrink.com': 0.9,
      'Hacker News': 0.4
    };
    if (!source) return 0.5;
    const s = source.toLowerCase();
    for (const key of Object.keys(weights)) {
      if (s.includes(key)) return weights[key];
    }
    return 0.6;
  }

  async loadBrands() {
    try {
      const res = await fetch('brands.json');
      if (!res.ok) return;
      const list = await res.json();
      if (Array.isArray(list)) this.brands = list;
    } catch (e) {
      console.warn('Could not load brands.json', e);
    }
  }

  async fetchAllNews() {
    try {
      const sources = [
        this.fetchFromGuardian(),
        this.fetchFromHackerNews(),
        this.fetchFromNewsAPI(),
        this.fetchFromRSSFeeds()
      ];

      const results = await Promise.allSettled(sources);
      let allArticles = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allArticles = allArticles.concat(result.value);
        }
      });

      // Deduplicate
      const seen = new Set();
      const unique = allArticles.filter(a => {
        const key = a.title + a.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Ensure brands are present and compute mention counts + score
      const now = Date.now();
      unique.forEach(a => {
        if (!a.brands) a.brands = this.detectBrands((a.title || '') + ' ' + (a.description || ''));
        a.mentionCount = Array.isArray(a.brands) ? a.brands.length : 0;
        // recency score: articles within 7 days get higher score
        const ageMs = now - new Date(a.pubDate || now).getTime();
        const days = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
        const recency = Math.max(0, 1 - (days / 7));
        const mentionScore = Math.min(1, a.mentionCount / 4);
        const sourceScore = this.sourceWeight(a.source || a.source?.name || '');
        // weighted score: recency 50%, mentions 30%, source 20%
        a.score = (recency * 0.5) + (mentionScore * 0.3) + (sourceScore * 0.2);
      });

      // compute brand counts map on aggregated set
      this._brandCounts = {};
      unique.forEach(a => {
        if (!Array.isArray(a.brands)) return;
        a.brands.forEach(b => { this._brandCounts[b] = (this._brandCounts[b] || 0) + 1; });
      });

      // Keep only liquor/alcohol related articles (whitelist)
      const liquorRegex = /(beer|wine|whiskey|bourbon|gin|vodka|rum|tequila|spirits|distillery|brewery|cocktail|mixology|sommelier|alcohol|liquor|rtd|seltzer|hard seltzer)/i;
      this.articles = unique
        .filter(a => liquorRegex.test((a.title || '') + ' ' + (a.description || '') + ' ' + (a.source || '')))
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      this.cache = this.articles;
      localStorage.setItem('news_cache', JSON.stringify(this.articles));
      localStorage.setItem('news_lastUpdate', new Date().toISOString());

      return this.articles;
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.cache;
    }
  }

  async fetchFromGuardian() {
    try {
      // Focused liquor/alcohol keywords only (avoid broad food/beverage terms)
      const terms = [
        'alcohol',
        'beer',
        'wine',
        'spirits',
        'distillery',
        'brewery',
        'liquor',
        'cocktail',
        'rum',
        'vodka',
        'whiskey',
        'bourbon',
        'tequila',
        'rtd',
        'hard seltzer'
      ];

      const articles = [];
      for (const term of terms) {
        const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(term)}&show-fields=thumbnail,trailText&api-key=test&page-size=20`;
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.response && data.response.results) {
              articles.push(...data.response.results.map(item => {
                const obj = {
                  title: item.webTitle,
                  description: item.fields?.trailText || 'Read more...',
                  url: item.webUrl,
                  image: item.fields?.thumbnail || '🍷',
                  source: 'The Guardian',
                  pubDate: item.webPublicationDate,
                  category: this.detectCategory(item.webTitle)
                };
                obj.brands = this.detectBrands(item.webTitle + ' ' + (obj.description || ''));
                return obj;
              }));
            }
          }
        } catch (e) {
          console.log('Guardian fetch failed for:', term);
        }
      }
      return articles;
    } catch (error) {
      return [];
    }
  }

  // Return aggregated brand counts
  brandCounts() {
    return this._brandCounts || {};
  }

  async fetchFromNewsAPI() {
    try {
      // Narrow topics to alcohol/liquor related keywords
      const topics = [
        'alcohol',
        'beer',
        'wine',
        'spirits',
        'liquor',
        'brewery',
        'distillery',
        'cocktail',
        'rtd',
        'hard seltzer'
      ];

      const articles = [];
      for (const topic of topics) {
        const url = `https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&language=en&pageSize=50`;
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.articles) {
              articles.push(...data.articles.map(a => {
                const obj = {
                  title: a.title,
                  description: a.description || a.content || 'Read more...',
                  url: a.url,
                  image: a.urlToImage || '🍷',
                  source: a.source.name,
                  pubDate: a.publishedAt,
                  category: this.detectCategory(a.title)
                };
                obj.brands = this.detectBrands(a.title + ' ' + (obj.description || ''));
                return obj;
              }));
            }
          }
        } catch (e) {
          console.log('NewsAPI fetch failed for:', topic);
        }
      }
      return articles;
    } catch (error) {
      return [];
    }
  }

  async fetchFromHackerNews() {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
      if (!response.ok) return [];

      const storyIds = await response.json();
      const articles = [];

      for (let i = 0; i < Math.min(30, storyIds.length); i++) {
        try {
          const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`);
          if (storyRes.ok) {
            const story = await storyRes.json();
            if (story.title) {
              const titleLower = story.title.toLowerCase();
              const hnRegex = /beer|wine|alcohol|spirit|whiskey|vodka|rum|tequila|distillery|brewery|cocktail|liquor|rtd|seltzer/i;
              if (hnRegex.test(titleLower)) {
                const hnObj = {
                  title: story.title,
                  description: `Posted ${story.time ? new Date(story.time * 1000).toLocaleDateString() : 'recently'}`,
                  url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                  image: '📰',
                  source: 'Hacker News',
                  pubDate: new Date(story.time * 1000).toISOString(),
                  category: 'business'
                };
                hnObj.brands = this.detectBrands(hnObj.title + ' ' + (hnObj.description || ''));
                articles.push(hnObj);
              }
            }
            }
          }
        } catch (e) {
          // Continue
        }
      }
      return articles;
    } catch (error) {
      return [];
    }
  }

  async fetchFromRSSFeeds() {
    const feeds = [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://www.cnbc.com/id/100003114/device/rss/rss.html',
      'https://www.thespiritsbusiness.com/feed/',
      'https://www.thedrinksbusiness.com/feed/',
      'https://www.liquor.com/feed/',
      'https://vinepair.com/feed/',
      'https://punchdrink.com/feed/'
    ];

    const articles = [];
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(feedUrl);
        if (response.ok) {
          const text = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'text/xml');

          const items = xml.querySelectorAll('item');
          items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            if (title.toLowerCase().match(/beverage|alcohol|beer|wine|spirit|drink|liquor/i)) {
              const articleObj = {
                title: title,
                description: item.querySelector('description')?.textContent?.substring(0, 200) || 'Read more...',
                url: item.querySelector('link')?.textContent || '#',
                image: '🍷',
                source: new URL(feedUrl).hostname,
                pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                category: this.detectCategory(title)
              };
              articleObj.brands = this.detectBrands(title + ' ' + (articleObj.description || ''));
              articles.push(articleObj);
            }
          });
        }
      } catch (e) {
        console.log('RSS fetch failed:', feedUrl);
      }
    }
    return articles;
  }

  detectCategory(text) {
    const lower = text.toLowerCase();
    if (lower.includes('beer') || lower.includes('brewery')) return 'beer';
    if (lower.includes('wine') || lower.includes('winery')) return 'wine';
    if (lower.includes('spirit') || lower.includes('whiskey') || lower.includes('vodka')) return 'spirits';
    if (lower.includes('rtd') || lower.includes('seltzer') || lower.includes('ready')) return 'rtd';
    if (lower.includes('regul') || lower.includes('law') || lower.includes('tax')) return 'regulation';
    if (lower.includes('trend') || lower.includes('market') || lower.includes('grow')) return 'trend';
    return 'business';
  }

  detectBrands(text) {
    if (!text) return [];
    const found = [];
    const lower = text.toLowerCase();
    for (const b of this.brands) {
      try {
        if (lower.includes(b.toLowerCase())) {
          if (!found.includes(b)) found.push(b);
        }
      } catch (e) {
        // ignore
      }
    }
    return found;
  }

  detectState(text) {
    const states = ['California', 'Texas', 'New York', 'Florida', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
    for (const state of states) {
      if (text.toLowerCase().includes(state.toLowerCase())) return state;
    }
    return 'National';
  }

  filterByCategory(articles, category) {
    if (category === 'all') return articles;
    return articles.filter(a => a.category === category);
  }

  filterByState(articles, state) {
    if (state === 'all') return articles;
    return articles.filter(a => this.detectState(a.title + a.description) === state);
  }

  search(articles, query) {
    if (!query) return articles;
    const lower = query.toLowerCase();
    return articles.filter(a => 
      a.title.toLowerCase().includes(lower) || 
      a.description.toLowerCase().includes(lower) ||
      a.source.toLowerCase().includes(lower)
    );
  }
}

const newsFetcher = new NewsFetcher();
