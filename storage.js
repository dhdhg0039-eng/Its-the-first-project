// Beverage Brain™ - Local Storage Management

class StorageManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.preferences = this.loadPreferences();
        this.lastUpdate = this.loadLastUpdate();
        this.cachedNews = this.loadCachedNews();
    }

    // ============ BOOKMARKS ============
    loadBookmarks() {
        try {
            const stored = localStorage.getItem(CONFIG.storage.bookmarks);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading bookmarks:', e);
            return [];
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem(CONFIG.storage.bookmarks, JSON.stringify(this.bookmarks));
        } catch (e) {
            console.error('Error saving bookmarks:', e);
        }
    }

    addBookmark(article) {
        const exists = this.bookmarks.find(b => b.url === article.url);
        if (!exists) {
            this.bookmarks.unshift({
                ...article,
                bookmarkedAt: new Date().toISOString()
            });
            this.saveBookmarks();
            return true;
        }
        return false;
    }

    removeBookmark(url) {
        this.bookmarks = this.bookmarks.filter(b => b.url !== url);
        this.saveBookmarks();
    }

    isBookmarked(url) {
        return this.bookmarks.some(b => b.url === url);
    }

    // ============ PREFERENCES ============
    loadPreferences() {
        try {
            const stored = localStorage.getItem(CONFIG.storage.preferences);
            return stored ? JSON.parse(stored) : {
                selectedCategories: ['all'],
                selectedStates: [],
                selectedRegions: ['usa'],
                theme: 'light',
                notificationsEnabled: false,
                sortBy: 'newest',
                timeRange: 7
            };
        } catch (e) {
            console.error('Error loading preferences:', e);
            return {};
        }
    }

    savePreferences() {
        try {
            localStorage.setItem(CONFIG.storage.preferences, JSON.stringify(this.preferences));
        } catch (e) {
            console.error('Error saving preferences:', e);
        }
    }

    updatePreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
    }

    // ============ CACHED NEWS ============
    loadCachedNews() {
        try {
            const stored = localStorage.getItem(CONFIG.storage.cachedNews);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading cached news:', e);
            return [];
        }
    }

    saveCachedNews(articles) {
        try {
            this.cachedNews = articles;
            localStorage.setItem(CONFIG.storage.cachedNews, JSON.stringify(articles));
        } catch (e) {
            console.error('Error saving cached news:', e);
        }
    }

    // ============ LAST UPDATE ============
    loadLastUpdate() {
        try {
            const stored = localStorage.getItem(CONFIG.storage.lastUpdate);
            return stored ? new Date(stored) : null;
        } catch (e) {
            console.error('Error loading last update:', e);
            return null;
        }
    }

    saveLastUpdate() {
        try {
            const now = new Date().toISOString();
            localStorage.setItem(CONFIG.storage.lastUpdate, now);
            this.lastUpdate = new Date(now);
        } catch (e) {
            console.error('Error saving last update:', e);
        }
    }

    // ============ INDEXEDDB FOR LARGE DATA ============
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }

            const request = indexedDB.open('BeverageBrainDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('articles')) {
                    db.createObjectStore('articles', { keyPath: 'url' });
                }
                if (!db.objectStoreNames.contains('chatHistory')) {
                    db.createObjectStore('chatHistory', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Clear all data
    clearAll() {
        try {
            localStorage.clear();
            this.bookmarks = [];
            this.preferences = {};
            this.cachedNews = [];
            this.lastUpdate = null;
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
    }

    // Get storage usage info
    getStorageInfo() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                return navigator.storage.estimate();
            }
        } catch (e) {
            console.error('Error getting storage info:', e);
        }
        return null;
    }
}

// Create global instance
const storage = new StorageManager();
