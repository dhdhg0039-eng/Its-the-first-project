// Beverage Brain™ - Real News API Integration

class NewsManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.allArticles = [];
    }

    // ============ FETCH REAL NEWS ============
    async fetchNewsFromMultipleSources() {
        try {
            const articles = [];

            // Method 1: Try NewsData.io free API (best option)
            const newsDataArticles = await this.fetchFromNewsData();
            articles.push(...newsDataArticles);

            // Method 2: Fallback - Fetch from RSS feeds directly (no API key needed)
            const rssArticles = await this.fetchFromRSSFeeds();
            articles.push(...rssArticles);

            // Deduplicate articles
            const uniqueArticles = this.deduplicateArticles(articles);

            // Cache the results
            storage.saveCachedNews(uniqueArticles);
            storage.saveLastUpdate();

            return uniqueArticles;
        } catch (error) {
            console.error('Error fetching news:', error);
            // Return cached data if fetch fails
            return storage.cachedNews;
        }
    }

    // Fetch from NewsData.io
    async fetchFromNewsData() {
        try {
            // Since we don't have a guaranteed API key, we'll use a data-fetching approach
            // that combines multiple free sources
            const searchTerms = [
                'beverage industry news',
                'alcohol market trends',
                'beer brewing',
                'wine industry',
                'spirits market',
                'liquor regulations',
                'RTD drinks',
                'craft beverages'
            ];

            const articles = [];

            for (const term of searchTerms) {
                try {
                    // Using NewsData.io with free tier (no API key required for basic search)
                    const response = await fetch(
                        `https://newsdata.io/api/1/news?q=${encodeURIComponent(term)}&language=en&max_results=10`,
                        {
                            headers: {
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.results) {
                            articles.push(...data.results.map(article => ({
                                ...article,
                                source: article.source_id || 'News Data',
                                image: article.image_url || '',
                                pubDate: article.pubDate || new Date().toISOString()
                            })));
                        }
                    }
                } catch (e) {
                    console.log(`Could not fetch from search term: ${term}`);
                }
                // Rate limiting - small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return articles;
        } catch (error) {
            console.error('NewsData.io fetch error:', error);
            return [];
        }
    }

    // Fetch from RSS feeds (no API key needed!)
    async fetchFromRSSFeeds() {
        const rssFeedUrls = [
            'https://feeds.bloomberg.com/markets/news.rss',
            'https://feeds.bloomberg.com/industries/beverages.rss',
            'https://www.cnbc.com/id/100003114/device/rss/rss.html',
            'https://www.cnbc.com/id/100005400/device/rss/rss.html'
        ];

        const articles = [];

        for (const feedUrl of rssFeedUrls) {
            try {
                const response = await fetch(feedUrl);
                if (response.ok) {
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, 'text/xml');

                    const items = xmlDoc.querySelectorAll('item');
                    items.forEach((item) => {
                        articles.push({
                            title: item.querySelector('title')?.textContent || 'Untitled',
                            description: item.querySelector('description')?.textContent || '',
                            link: item.querySelector('link')?.textContent || '',
                            url: item.querySelector('link')?.textContent || '',
                            pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                            source: new URL(feedUrl).hostname,
                            image: this.extractImageFromRSS(item)
                        });
                    });
                }
            } catch (error) {
                console.log(`Could not fetch RSS from ${feedUrl}`);
            }
        }

        return articles;
    }

    extractImageFromRSS(item) {
        // Try different image sources in RSS
        const imageElement = item.querySelector('image');
        if (imageElement) return imageElement.textContent;

        const enclosure = item.querySelector('enclosure[type*="image"]');
        if (enclosure) return enclosure.getAttribute('url');

        const media = item.querySelector('[url*="image"], [src*="image"]');
        if (media) return media.getAttribute('url') || media.getAttribute('src');

        return '📰';
    }

    // Web Scraping fallback (for popular news sites)
    async fetchFromWebScraping() {
        try {
            // Using free scraping API alternatives
            const sources = [
                {
                    name: 'Industry Websites',
                    urls: [
                        'https://www.beverageaccessories.com',
                        'https://www.bevindustry.com'
                    ]
                }
            ];

            const articles = [];

            // This would require a server-side scraper in production
            // For now, we focus on NewsData.io and RSS feeds

            return articles;
        } catch (error) {
            console.error('Web scraping error:', error);
            return [];
        }
    }

    // Deduplicate articles
    deduplicateArticles(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = (article.title || '') + (article.url || article.link || '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // ============ CATEGORIZATION ============
    categorizeArticle(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        for (const [category, keywords] of Object.entries(CONFIG.categories)) {
            if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        return 'business'; // Default category
    }

    // ============ STATE DETECTION ============
    detectStates(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        const foundStates = [];

        CONFIG.usStates.forEach(state => {
            const stateAbbreviations = {
                'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
                'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
                'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
                'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
                'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
                'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
                'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
                'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
                'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
                'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
                'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
                'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
                'Wisconsin': 'WI', 'Wyoming': 'WY'
            };

            if (text.includes(state.toLowerCase()) || text.includes(stateAbbreviations[state] || '')) {
                foundStates.push(state);
            }
        });

        return foundStates;
    }

    // ============ FILTERING ============
    filterArticles(filters) {
        let filtered = this.articles;

        // Category filter
        if (filters.categories && filters.categories.length > 0 && !filters.categories.includes('all')) {
            filtered = filtered.filter(article => filters.categories.includes(article.category));
        }

        // State filter
        if (filters.states && filters.states.length > 0) {
            filtered = filtered.filter(article => 
                article.states.some(state => filters.states.includes(state))
            );
        }

        // Region filter
        if (filters.regions) {
            filtered = filtered.filter(article => {
                if (filters.regions.includes('usa') && article.states.length > 0) return true;
                if (filters.regions.includes('international') && article.states.length === 0) return true;
                return false;
            });
        }

        // Search query
        if (filters.query) {
            const query = filters.query.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.source.toLowerCase().includes(query)
            );
        }

        // Time range filter
        if (filters.timeRange) {
            const now = new Date();
            const timeLimit = new Date(now.getTime() - filters.timeRange * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(article => new Date(article.pubDate) >= timeLimit);
        }

        this.filteredArticles = filtered;
        return filtered;
    }

    // ============ SORTING ============
    sortArticles(articles, sortBy) {
        const sorted = [...articles];

        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
                break;
            case 'relevance':
                // This would require more sophisticated ranking
                sorted.sort(() => Math.random() - 0.5);
                break;
        }

        return sorted;
    }

    // ============ ENRICHMENT ============
    enrichArticles(articles) {
        return articles.map(article => ({
            ...article,
            category: this.categorizeArticle(article),
            states: this.detectStates(article),
            isBookmarked: storage.isBookmarked(article.url || article.link),
            displayImage: article.image || article.image_url || this.getCategoryEmoji(article.category)
        }));
    }

    getCategoryEmoji(category) {
        const emojis = {
            beer: '🍺',
            wine: '🍷',
            spirits: '🥃',
            rtd: '🥤',
            regulations: '⚖️',
            trends: '📈',
            business: '💼'
        };
        return emojis[category] || '📰';
    }

    // ============ PUBLIC METHODS ============
    async loadArticles() {
        // Fetch new articles
        const freshArticles = await this.fetchNewsFromMultipleSources();

        // Enrich with metadata
        this.articles = this.enrichArticles(freshArticles);
        this.allArticles = this.articles;

        return this.articles;
    }

    getArticles() {
        return this.filteredArticles.length > 0 ? this.filteredArticles : this.articles;
    }

    getCachedArticles() {
        return this.enrichArticles(storage.cachedNews);
    }
}

// Create global instance
const newsManager = new NewsManager();
