// ===================================
// Main Application Logic
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global state
let currentView = 'home';
let currentFilter = 'all';

/* Helpers */
function getEl(id) { return document.getElementById(id); }
function safeAddListener(el, evt, fn) { if (el) el.addEventListener(evt, fn); }
function debounce(fn, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Initialize the application
 */
function initApp() {
    console.log('Movie App initialized');

    // Set up event listeners
    setupEventListeners();

    // Load initial view
    showView('home');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.addEventListener('click', handleNavigation));

    // Search functionality
    const searchBtn = getEl('search-btn');
    const searchInput = getEl('search-input');

    safeAddListener(searchBtn, 'click', handleSearch);
    if (searchInput) {
        safeAddListener(searchInput, 'keydown', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        // Debounced input search (optional)
        const debounced = debounce(() => {
            const term = searchInput.value.trim();
            if (term) handleSearch();
        }, 600);
        safeAddListener(searchInput, 'input', debounced);
    }

    // Back button in details view
    const backBtn = getEl('back-btn');
    safeAddListener(backBtn, 'click', () => showView('home'));

    // Filter buttons in watchlist
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));
}

/**
 * Handle navigation between views
 */
function handleNavigation(e) {
    const targetView = e.target.dataset.view;
    if (targetView) showView(targetView);
}

/**
 * Show a specific view and hide others
 */
function showView(viewName) {
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected view
    const selectedView = getEl(`${viewName}-view`);
    if (!selectedView) return;
    selectedView.classList.add('active');

    // Highlight active nav button
    const activeNavBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    // Update current view
    currentView = viewName;

    // Load view-specific data
    if (viewName === 'watchlist') {
        renderWatchlist(currentFilter);
    } else if (viewName === 'home') {
        // render recommendations when showing home
        if (typeof renderRecommendations === 'function') {
            renderRecommendations();
        }
    }
}

/**
 * Handle search input
 */
function handleSearch() {
    const searchInput = getEl('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
        showError('Please enter a movie title');
        return;
    }

    // Hide recommendations, show search results section
    const recommendationsSection = getEl('recommendations-section');
    const searchResultsSection = getEl('search-results'); // matches index.html

    if (recommendationsSection) recommendationsSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.remove('hidden');

    // Clear previous results
    clearSearchResults();

    // Show loading state
    showLoading(true);

    // Perform search
    if (typeof searchMovies === 'function') {
        searchMovies(searchTerm);
    } else {
        showLoading(false);
        showError('Search function not available');
    }
}

/**
 * Handle filter changes in watchlist
 */
function handleFilter(e) {
    // Update active filter button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (e.target) e.target.classList.add('active');

    // Get filter value
    const filter = e.target.dataset.filter;
    currentFilter = filter || 'all';

    // Re-render watchlist with filter
    renderWatchlist(currentFilter);
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
    const loading = getEl('loading');
    if (!loading) return;
    if (show) loading.classList.remove('hidden'); else loading.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = getEl('error-message');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

/**
 * Clear search results
 */
function clearSearchResults() {
    const resultsContainer = getEl('search-results');
    if (resultsContainer) resultsContainer.innerHTML = '';

    const errorElement = getEl('error-message');
    if (errorElement) errorElement.classList.add('hidden');
}

// Export functions if needed (for testing or modular imports)
// In a production app, you might use ES6 modules