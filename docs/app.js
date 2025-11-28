// Main app controller
class App {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    // default to spirits/liquor so users see liquor news immediately
    this.selectedCategory = 'spirits';
    this.selectedState = 'all';
    this.searchQuery = '';
    this.updateInterval = null;
    this.init();
  }

  async init() {
    console.log('🍷 Beverage Brain initializing...');
    
    this.setupEventListeners();
    await this.loadNews();
    
    // Auto-refresh every 30 minutes
    this.updateInterval = setInterval(() => this.loadNews(), 30 * 60 * 1000);
    
    console.log('✅ Beverage Brain ready!');
  }

  setupEventListeners() {
    // Category filters
    document.querySelectorAll('[data-category]').forEach(el => {
      el.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.applyFilters();
      });
    });

    // State filters
    document.querySelectorAll('[data-state]').forEach(el => {
      el.addEventListener('change', (e) => {
        this.selectedState = e.target.value;
        this.applyFilters();
      });
    });

    // Search
    const searchBox = document.getElementById('search');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadNews());
    }

    // Chat widget
    const chatToggle = document.getElementById('chat-toggle');
    const chatWidget = document.getElementById('chat-widget');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');

    if (chatToggle) {
      chatToggle.addEventListener('click', () => {
        chatWidget.classList.remove('hidden');
        chatToggle.style.display = 'none';
      });
    }

    if (chatClose) {
      chatClose.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
        chatToggle.style.display = 'flex';
      });
    }

    if (chatSend) {
      chatSend.addEventListener('click', () => this.sendChatMessage());
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendChatMessage();
      });
    }
  }

  async loadNews() {
    const loading = document.getElementById('news-loading');
    if (loading) loading.style.display = 'flex';

    this.articles = await newsFetcher.fetchAllNews();
    this.applyFilters();

    if (loading) loading.style.display = 'none';
    this.updateStatus();
  }

  applyFilters() {
    let filtered = this.articles;

    // Category filter
    filtered = newsFetcher.filterByCategory(filtered, this.selectedCategory);

    // State filter
    filtered = newsFetcher.filterByState(filtered, this.selectedState);

    // Search
    filtered = newsFetcher.search(filtered, this.searchQuery);

    this.filteredArticles = filtered;
    this.renderNews();
  }

  renderNews() {
    const container = document.getElementById('news-grid');
    if (!container) return;

    if (this.filteredArticles.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <h3>No articles found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredArticles.map(article => `
      <div class="article-card">
        <div class="article-image">
          ${typeof article.image === 'string' && article.image.startsWith('http') 
            ? `<img src="${article.image}" alt="${article.title}">` 
            : article.image}
        </div>
        <div class="article-content">
          <div class="article-meta">
            <span class="article-category">${article.category.toUpperCase()}</span>
            <span class="article-time">${this.formatDate(article.pubDate)}</span>
          </div>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-description">${article.description}</p>
          <div style="font-size: 0.85rem; margin-bottom: 1rem;">
            <span class="article-source">${article.source}</span>
            <span class="article-state">${newsFetcher.detectState(article.title + article.description)}</span>
          </div>
          <div class="article-footer">
            <a href="${article.url}" target="_blank">Read Full Article</a>
            <button class="bookmark-btn" onclick="app.toggleBookmark('${article.url}', this)">📌</button>
          </div>
        </div>
      </div>
    `).join('');

    const count = document.getElementById('article-count');
    if (count) count.textContent = `${this.filteredArticles.length} Articles`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  toggleBookmark(url, btn) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const index = bookmarks.indexOf(url);

    if (index > -1) {
      bookmarks.splice(index, 1);
      btn.style.opacity = '0.6';
    } else {
      bookmarks.push(url);
      btn.style.opacity = '1';
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (!input.value.trim()) return;

    const userMsg = input.value;
    input.value = '';

    // Add user message
    const userEl = document.createElement('div');
    userEl.className = 'message user';
    userEl.innerHTML = `<div class="message-bubble">${userMsg}</div>`;
    messages.appendChild(userEl);

    // Get AI response
    const response = await aiChat.chat(userMsg);

    // Add AI message
    const aiEl = document.createElement('div');
    aiEl.className = 'message bot';
    aiEl.innerHTML = `<div class="message-bubble">${response}</div>`;
    messages.appendChild(aiEl);

    messages.scrollTop = messages.scrollHeight;
  }

  updateStatus() {
    const status = document.getElementById('update-status');
    if (status) {
      const now = new Date().toLocaleTimeString();
      status.textContent = `Last updated: ${now}`;
    }
  }
}

const app = new App();
