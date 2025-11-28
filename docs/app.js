// Main app controller
class App {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    // default to spirits/liquor so users see liquor news immediately
    this.selectedCategory = 'spirits';
    this.selectedBrand = 'all';
    this.selectedState = 'all';
    this.searchQuery = '';
    this.updateInterval = null;
    this.init();
  }

  async init() {
    console.log('🍷 Beverage Brain initializing...');
    
    this.setupEventListeners();
    // load brands first so detection works
    if (typeof newsFetcher.loadBrands === 'function') await newsFetcher.loadBrands();

    // Only fetch news if 30 minutes have passed since last update.
    // Otherwise use cached articles to avoid fetching on every user refresh.
    const last = localStorage.getItem('news_lastUpdate');
    const now = Date.now();
    const THIRTY_MIN = 30 * 60 * 1000;
    if (!last || (now - new Date(last).getTime()) > THIRTY_MIN) {
      await this.loadNews();
    } else {
      // load from cache and render immediately
      this.articles = newsFetcher.cache || [];
      this.applyFilters();
      this.updateStatus();
      // ensure loading placeholder is hidden when using cache
      const loading = document.getElementById('news-loading');
      if (loading) loading.style.display = 'none';
    }
    
    // Auto-refresh every 30 minutes
    this.updateInterval = setInterval(() => this.loadNews(), 30 * 60 * 1000);
    
    console.log('✅ Beverage Brain ready!');
  }

  setupEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
      });
    }

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

    // Brand cloud - delegated click handler
    document.getElementById('brand-cloud')?.addEventListener('click', (e) => {
      const tag = e.target.closest('[data-brand]');
      if (!tag) return;
      const brand = tag.getAttribute('data-brand');
      if (!brand) return;
      // toggle
      this.selectedBrand = this.selectedBrand === brand ? 'all' : brand;
      this.applyFilters();
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

    // Press release modal handlers
    const pressModal = document.getElementById('press-modal');
    const pressSend = document.getElementById('press-send');
    const pressClose = document.getElementById('press-close');
    const pressCancel = document.getElementById('press-cancel');

    document.querySelectorAll('.btn-ghost').forEach(b => {
      b.addEventListener('click', (e) => {
        // Advertise button opens press release modal
        if (b.getAttribute('href')?.startsWith('mailto:')) {
          // also show modal
          if (pressModal) pressModal.classList.remove('hidden');
        }
      });
    });

    pressClose?.addEventListener('click', () => pressModal.classList.add('hidden'));
    pressCancel?.addEventListener('click', () => pressModal.classList.add('hidden'));

    pressSend?.addEventListener('click', () => {
      const name = document.getElementById('pr-name')?.value || '';
      const email = document.getElementById('pr-email')?.value || '';
      const company = document.getElementById('pr-company')?.value || '';
      const subject = document.getElementById('pr-subject')?.value || 'Press Release';
      const message = document.getElementById('pr-message')?.value || '';

      const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0ACompany: ${company}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const mailto = `mailto:kushalpatel1239@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
      if (pressModal) pressModal.classList.add('hidden');
    });

    // Filter toggle: show/hide sidebar and overlay
    const filterToggle = document.getElementById('filter-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    filterToggle?.addEventListener('click', () => {
      if (!sidebar) return;
      const isCollapsed = sidebar.classList.contains('collapsed');
      if (isCollapsed) {
        sidebar.classList.remove('collapsed');
        overlay?.classList.remove('hidden');
      } else {
        sidebar.classList.add('collapsed');
        overlay?.classList.add('hidden');
      }
    });
    overlay?.addEventListener('click', () => {
      sidebar?.classList.add('collapsed');
      overlay.classList.add('hidden');
    });
  }

  async loadNews() {
    const loading = document.getElementById('news-loading');
    if (loading) loading.style.display = 'flex';

    try {
      this.articles = await newsFetcher.fetchAllNews();
      this.applyFilters();
    } catch (e) {
      console.error('Error loading news:', e);
    }

    if (loading) loading.style.display = 'none';
  }

  applyFilters() {
    let filtered = this.articles;

    // Category filter
    filtered = newsFetcher.filterByCategory(filtered, this.selectedCategory);

    // Brand filter
    if (this.selectedBrand && this.selectedBrand !== 'all') {
      filtered = filtered.filter(a => Array.isArray(a.brands) && a.brands.includes(this.selectedBrand));
    }

    // State filter
    filtered = newsFetcher.filterByState(filtered, this.selectedState);

    // Search
    filtered = newsFetcher.search(filtered, this.searchQuery);

    this.filteredArticles = filtered;
    this.renderNews();
    // hide loading spinner immediately
    const loading = document.getElementById('news-loading');
    if (loading) loading.style.display = 'none';
  }

  renderNews() {
    const container = document.getElementById('news-grid');
    if (!container) return;

    // Render brand cloud summary
    this.renderBrandCloud();

    // Render featured hero (pick top article)
    this.renderFeatured();

    // Render trending brands
    this.renderTrending();

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

  renderFeatured() {
    const hero = document.getElementById('featured-hero');
    const img = document.getElementById('featured-image');
    const title = document.getElementById('featured-title');
    const desc = document.getElementById('featured-desc');
    const link = document.getElementById('featured-link');
    const meta = document.getElementById('featured-meta');

    if (!hero || !title) return;

    // choose highest-scoring article as featured
    const pool = (this.filteredArticles && this.filteredArticles.length) ? this.filteredArticles : (this.articles || []);
    let article = null;
    if (pool && pool.length) {
      article = pool.reduce((best, cur) => {
        if (!best) return cur;
        return (cur.score || 0) > (best.score || 0) ? cur : best;
      }, null);
    } else {
      article = this.articles[0] || null;
    }
    if (!article) {
      hero.classList.add('hidden');
      return;
    }

    hero.classList.remove('hidden');
    if (img) img.innerHTML = typeof article.image === 'string' && article.image.startsWith('http') ? `<img src="${article.image}" alt="${article.title}">` : (article.image || '🍷');
    if (meta) meta.textContent = (article.source || 'Source');
    title.textContent = article.title || 'Featured article';
    desc.textContent = (article.description || '').replace(/<[^>]+>/g, '').substring(0, 260);
    if (link) link.href = article.url || '#';
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

  renderBrandCloud() {
    const cloud = document.getElementById('brand-cloud');
    if (!cloud) return;

    // Collect brand counts from current articles
    const counts = {};
    for (const a of this.articles) {
      if (!Array.isArray(a.brands)) continue;
      for (const b of a.brands) {
        counts[b] = (counts[b] || 0) + 1;
      }
    }

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      cloud.innerHTML = '<p style="font-size:0.9rem;color:#666;">No brands identified yet</p>';
      return;
    }

    cloud.innerHTML = entries.slice(0, 40).map(([brand, count]) => {
      const cls = this.selectedBrand === brand ? 'brand-tag active' : 'brand-tag';
      return `<button data-brand="${brand}" class="${cls}" title="Filter by ${brand}">${brand} <span class="badge">${count}</span></button>`;
    }).join(' ');
  }

  renderTrending() {
    const list = document.getElementById('trending-list');
    if (!list) return;
    const counts = newsFetcher.brandCounts();
    const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    if (entries.length === 0) {
      list.innerHTML = '<span style="color:#666">No trending brands yet</span>';
      return;
    }
    list.innerHTML = entries.slice(0, 12).map(([brand, count]) => `<button class="trending-tag" data-brand="${brand}">${brand} <span class="tcount">${count}</span></button>`).join(' ');

    // attach click handlers for quick filter
    list.querySelectorAll('.trending-tag').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const b = btn.getAttribute('data-brand');
        if (!b) return;
        this.selectedBrand = this.selectedBrand === b ? 'all' : b;
        // open sidebar so user sees brand cloud selected
        document.getElementById('sidebar')?.classList.remove('hidden');
        this.applyFilters();
      });
    });
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
    // Status update removed - no longer showing timestamp
  }
}

const app = new App();
