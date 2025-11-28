// Beverage Brain™ - Main Application Controller

class BeverageBrain {
    constructor() {
        this.isInitialized = false;
        this.updateInterval = null;
    }

    // ============ INITIALIZATION ============
    async init() {
        console.log('🍷 Beverage Brain™ initializing...');

        try {
            // Load initial data
            await this.loadInitialData();

            // Set up auto-refresh
            this.setupAutoRefresh();

            // Set up event listeners for visibility
            document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

            this.isInitialized = true;
            console.log('✅ Beverage Brain™ ready!');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async loadInitialData() {
        const newsFeed = document.getElementById('newsFeed');
        newsFeed.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading real beverage news from multiple sources...</p>
            </div>
        `;

        try {
            // Load articles
            const articles = await newsManager.loadArticles();
            
            if (articles.length > 0) {
                console.log(`✅ Loaded ${articles.length} articles`);
            } else {
                // Use cached data
                newsManager.articles = newsManager.getCachedArticles();
                console.log(`📦 Using ${newsManager.articles.length} cached articles`);
            }

            // Display initial news
            ui.applyFilters();
            ui.updateLastUpdateTime();
        } catch (error) {
            console.error('Error loading data:', error);
            const cached = newsManager.getCachedArticles();
            if (cached.length > 0) {
                newsManager.articles = cached;
                ui.applyFilters();
                newsFeed.innerHTML += '<p style="text-align: center; color: #ff9800;">⚠️ Using cached data (offline mode)</p>';
            } else {
                newsFeed.innerHTML = `
                    <div class="no-results">
                        <h3>📭 Unable to Load News</h3>
                        <p>Could not connect to news sources. Please check your internet connection and try again.</p>
                        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                    </div>
                `;
            }
        }
    }

    setupAutoRefresh() {
        // Refresh every 30 minutes
        this.updateInterval = setInterval(async () => {
            if (document.visibilityState === 'visible') {
                await this.refreshNews();
            }
        }, CONFIG.updateInterval);

        // Log the interval
        console.log(`🔄 Auto-refresh set for every ${CONFIG.updateInterval / 60000} minutes`);
    }

    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Page just became visible - do a refresh
            this.refreshNews();
        }
    }

    async refreshNews() {
        console.log('🔄 Refreshing news...');
        const articles = await newsManager.loadArticles();
        console.log(`✅ Refreshed: ${articles.length} articles loaded`);
        ui.applyFilters();
    }

    // ============ UTILITIES ============
    getAppVersion() {
        return '1.0.0';
    }

    getAppInfo() {
        return {
            name: 'Beverage Brain™',
            version: this.getAppVersion(),
            owner: 'Team TwinFlame™',
            contact: 'kushalpatel1239@gmail.com',
            features: [
                'Real-time beverage industry news',
                'Multi-source data aggregation',
                'AI assistant powered by local knowledge base',
                'Advanced search and filtering',
                'State-level regional insights',
                'Bookmarking and offline access',
                'Browser notifications',
                'Auto-refresh every 30 minutes',
                'International and USA-focused coverage'
            ]
        };
    }
}

// ============ STARTUP ============
const app = new BeverageBrain();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for debugging
window.BeverageBrain = {
    app,
    newsManager,
    aiAssistant,
    storage,
    ui,
    CONFIG
};
