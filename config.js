// Beverage Brain™ - Configuration

const CONFIG = {
    // News API Configuration (Free Tier)
    newsAPI: {
        // Using NewsData.io (500 requests/day free tier)
        baseUrl: 'https://newsdata.io/api/1/news',
        // Free API - consider using alternative if this doesn't work
        // We'll implement local RSS parsing as backup
    },

    // AI Configuration
    ai: {
        // Using OpenRouter free models
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        // Models available on free tier: Mistral 7B, Llama 3, etc.
    },

    // Update frequency (30 minutes in milliseconds)
    updateInterval: 30 * 60 * 1000,

    // Notification settings
    notifications: {
        enabled: false,
        interval: 60 * 60 * 1000, // 1 hour
    },

    // Categories for beverage industry
    categories: {
        beer: ['beer', 'brewery', 'ipa', 'lager', 'pilsner', 'craft beer'],
        wine: ['wine', 'winery', 'grapes', 'vintage', 'burgundy', 'chardonnay'],
        spirits: ['spirits', 'liquor', 'whiskey', 'vodka', 'rum', 'gin', 'tequila', 'cognac', 'liqueur'],
        rtd: ['rtd', 'canned cocktail', 'ready to drink', 'premix', 'seltzer', 'hard seltzer'],
        regulations: ['regulation', 'law', 'tax', 'license', 'excise', 'abc', 'fda'],
        trends: ['trend', 'sales', 'growth', 'market', 'consumer', 'innovation'],
        business: ['business', 'merger', 'acquisition', 'deal', 'company', 'brand'],
    },

    // US States
    usStates: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
    ],

    // Search keywords for beverage industry
    searchKeywords: [
        'beverage', 'alcohol', 'beer', 'wine', 'spirits', 'liquor', 'distillery',
        'brewery', 'winery', 'cocktail', 'rtd', 'seltzer', 'hard seltzer', 'brandy',
        'tequila', 'rum', 'vodka', 'gin', 'whiskey', 'bourbon', 'scotch'
    ],

    // Storage keys
    storage: {
        bookmarks: 'bbrain_bookmarks',
        lastUpdate: 'bbrain_lastUpdate',
        cachedNews: 'bbrain_cachedNews',
        preferences: 'bbrain_preferences',
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
