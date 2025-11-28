// Beverage Brain™ - UI Management

class UIManager {
    constructor() {
        this.currentPage = 1;
        this.articlesPerPage = 10;
        this.setupEventListeners();
        this.populateFilters();
    }

    // ============ EVENT LISTENERS ============
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshNews());

        // Notifications button
        document.getElementById('notifyBtn').addEventListener('click', () => this.toggleNotifications());

        // Bookmarks button
        document.getElementById('bookmarksBtn').addEventListener('click', () => this.openBookmarks());

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));

        // Category filters
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });

        // State filters
        document.querySelectorAll('.state-filter').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });

        // Region filters
        document.querySelectorAll('.region-filter').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });

        // Time range select
        document.getElementById('timeRange').addEventListener('change', () => this.applyFilters());

        // Sort select
        document.getElementById('sortBy').addEventListener('change', () => this.applyFilters());

        // Clear filters button
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());

        // Chat functionality
        document.getElementById('chatSendBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Chat toggle
        document.getElementById('chatToggle').addEventListener('click', () => this.toggleChat());

        // Bookmarks modal close
        document.getElementById('closeBookmarks').addEventListener('click', () => this.closeBookmarks());
    }

    // ============ FILTERS ============
    populateFilters() {
        // Populate state filters
        const stateFiltersContainer = document.getElementById('stateFilters');
        CONFIG.usStates.forEach(state => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'state-filter';
            input.value = state;
            input.addEventListener('change', () => this.applyFilters());
            label.appendChild(input);
            label.appendChild(document.createTextNode(state));
            stateFiltersContainer.appendChild(label);
        });
    }

    getFilters() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(el => el.value);
        const selectedStates = Array.from(document.querySelectorAll('.state-filter:checked'))
            .map(el => el.value);
        const selectedRegions = Array.from(document.querySelectorAll('.region-filter:checked'))
            .map(el => el.value);
        const query = document.getElementById('searchInput').value;
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const sortBy = document.getElementById('sortBy').value;

        return {
            categories: selectedCategories,
            states: selectedStates,
            regions: selectedRegions,
            query,
            timeRange,
            sortBy
        };
    }

    applyFilters() {
        const filters = this.getFilters();
        let filtered = newsManager.filterArticles(filters);
        filtered = newsManager.sortArticles(filtered, filters.sortBy);
        this.displayNews(filtered);
    }

    clearFilters() {
        document.querySelectorAll('.category-filter, .state-filter').forEach(el => {
            if (el.value === 'all') {
                el.checked = true;
            } else {
                el.checked = false;
            }
        });
        document.querySelectorAll('.region-filter').forEach(el => {
            el.checked = el.value === 'usa';
        });
        document.getElementById('searchInput').value = '';
        document.getElementById('timeRange').value = '7';
        document.getElementById('sortBy').value = 'newest';
        this.applyFilters();
    }

    // ============ SEARCH ============
    handleSearch(event) {
        const query = event.target.value;
        
        if (query.length > 0) {
            // Show search suggestions
            const suggestions = this.generateSearchSuggestions(query);
            this.displaySearchSuggestions(suggestions);
        } else {
            document.getElementById('searchSuggestions').innerHTML = '';
        }

        // Apply filters on change
        this.applyFilters();
    }

    generateSearchSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Category suggestions
        Object.keys(CONFIG.categories).forEach(category => {
            if (category.includes(lowerQuery)) {
                suggestions.push({
                    type: 'category',
                    text: `📂 ${category}`,
                    value: category
                });
            }
        });

        // State suggestions
        CONFIG.usStates.forEach(state => {
            if (state.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    type: 'state',
                    text: `🗺️ ${state}`,
                    value: state
                });
            }
        });

        // Keyword suggestions
        const keywords = ['beer', 'wine', 'spirits', 'liquor', 'regulation', 'market', 'trend', 'business'];
        keywords.forEach(keyword => {
            if (keyword.includes(lowerQuery)) {
                suggestions.push({
                    type: 'keyword',
                    text: `🔍 ${keyword}`,
                    value: keyword
                });
            }
        });

        return suggestions.slice(0, 5);
    }

    displaySearchSuggestions(suggestions) {
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="ui.selectSuggestion('${suggestion.value}')">${suggestion.text}</div>
        `).join('');
    }

    selectSuggestion(value) {
        // Check if it's a state or category
        if (CONFIG.usStates.includes(value)) {
            const stateCheckbox = Array.from(document.querySelectorAll('.state-filter')).find(el => el.value === value);
            if (stateCheckbox) {
                stateCheckbox.checked = true;
            }
        }
        document.getElementById('searchInput').value = value;
        document.getElementById('searchSuggestions').innerHTML = '';
        this.applyFilters();
    }

    // ============ NEWS DISPLAY ============
    displayNews(articles) {
        const newsFeed = document.getElementById('newsFeed');
        const newsCount = document.getElementById('newsCount');

        newsCount.textContent = `${articles.length} articles`;

        if (articles.length === 0) {
            newsFeed.innerHTML = `
                <div class="no-results">
                    <h3>📭 No Articles Found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        newsFeed.innerHTML = articles.map(article => this.createNewsCard(article)).join('');

        // Add event listeners to cards
        newsFeed.querySelectorAll('.news-card').forEach(card => {
            const bookmarkBtn = card.querySelector('.news-bookmark-btn');
            bookmarkBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleBookmark(article, bookmarkBtn);
            });

            const shareBtn = card.querySelector('.btn-share');
            shareBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareArticle(article);
            });
        });
    }

    createNewsCard(article) {
        const bookmarkClass = storage.isBookmarked(article.url || article.link) ? 'bookmarked' : '';
        const stateHtml = article.states && article.states.length > 0 
            ? article.states.map(state => `<span class="news-state">${state}</span>`).join('')
            : '';

        return `
            <div class="news-card" data-url="${article.url || article.link}">
                <div class="news-image">${article.displayImage}</div>
                <div class="news-content">
                    <div class="news-header">
                        <span class="news-category">${article.category.toUpperCase()}</span>
                        <button class="news-bookmark-btn ${bookmarkClass}" title="Bookmark this article">📌</button>
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-description">${article.description}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source}</span>
                        <span>${this.formatDate(article.pubDate)}</span>
                        ${stateHtml}
                    </div>
                    <div class="news-footer">
                        <a href="${article.url || article.link}" target="_blank" class="btn-read">Read Full Article →</a>
                        <button class="btn-share" title="Share this article">🔗 Share</button>
                    </div>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // ============ BOOKMARKS ============
    toggleBookmark(article, buttonElement) {
        if (storage.isBookmarked(article.url || article.link)) {
            storage.removeBookmark(article.url || article.link);
            buttonElement.classList.remove('bookmarked');
        } else {
            storage.addBookmark(article);
            buttonElement.classList.add('bookmarked');
        }
    }

    openBookmarks() {
        const modal = document.getElementById('bookmarksModal');
        const bookmarksList = document.getElementById('bookmarksList');

        if (storage.bookmarks.length === 0) {
            bookmarksList.innerHTML = '<p>No saved articles yet. Bookmark articles to save them here!</p>';
        } else {
            bookmarksList.innerHTML = storage.bookmarks.map((article, index) => `
                <div class="bookmark-item">
                    <h4>${article.title}</h4>
                    <p><strong>${article.source}</strong> • ${this.formatDate(article.pubDate || article.bookmarkedAt)}</p>
                    <p>${article.description}</p>
                    <a href="${article.url || article.link}" target="_blank" class="btn btn-primary" style="display: inline-block;">Open Article</a>
                    <button class="bookmark-remove" onclick="ui.removeBookmark(${index})">Remove</button>
                </div>
            `).join('');
        }

        modal.classList.remove('hidden');
    }

    closeBookmarks() {
        document.getElementById('bookmarksModal').classList.add('hidden');
    }

    removeBookmark(index) {
        const url = storage.bookmarks[index].url || storage.bookmarks[index].link;
        storage.removeBookmark(url);
        this.openBookmarks();
    }

    // ============ SHARING ============
    shareArticle(article) {
        const text = `Check out this beverage industry article: "${article.title}" - Powered by Beverage Brain™`;
        const url = article.url || article.link;

        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: text,
                url: url
            }).catch(err => console.log('Share error:', err));
        } else {
            // Fallback: copy to clipboard
            const shareText = `${text}\n\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Article link copied to clipboard!');
            });
        }
    }

    // ============ CHAT ============
    async sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message) return;

        // Clear input
        chatInput.value = '';

        // Add user message to UI
        this.addChatMessageUI('user', message);

        // Get AI response
        const response = await aiAssistant.chat(message);
        this.addChatMessageUI('bot', response);
    }

    addChatMessageUI(role, message) {
        const chatContent = document.getElementById('chatContent');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;
        messageDiv.innerHTML = `<p>${this.escapeHtml(message)}</p>`;
        chatContent.appendChild(messageDiv);
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    toggleChat() {
        const chatPanel = document.querySelector('.chat-panel');
        const chatToggle = document.getElementById('chatToggle');
        chatPanel.classList.toggle('collapsed');
        chatToggle.textContent = chatPanel.classList.contains('collapsed') ? '+' : '−';
    }

    // ============ NOTIFICATIONS ============
    async toggleNotifications() {
        if (!('Notification' in window)) {
            alert('Your browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            this.disableNotifications();
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.enableNotifications();
            }
        }
    }

    enableNotifications() {
        storage.updatePreference('notificationsEnabled', true);
        document.getElementById('notifyBtn').classList.add('active');
        this.showNotification('Notifications Enabled!', 'You will receive alerts about new beverage industry news.');
    }

    disableNotifications() {
        storage.updatePreference('notificationsEnabled', false);
        document.getElementById('notifyBtn').classList.remove('active');
    }

    showNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍷</text></svg>',
                badge: '🍷'
            });
        }
    }

    // ============ UTILITIES ============
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    async refreshNews() {
        const btn = document.getElementById('refreshBtn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Loading...';
        btn.disabled = true;

        try {
            const articles = await newsManager.loadArticles();
            this.applyFilters();
            this.updateLastUpdateTime();
            this.showNotification('✅ News Updated', `${articles.length} articles loaded`);
        } catch (error) {
            console.error('Refresh error:', error);
            alert('Could not refresh news. Using cached data.');
        }

        btn.textContent = originalText;
        btn.disabled = false;
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastUpdateTime').textContent = timeString;
    }
}

// Create global instance
const ui = new UIManager();
