// ===================================
// Main Application Logic
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global state
let currentView = 'home';
let currentFilter = 'all';

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
    navButtons.forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });
    
    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Back button in details view
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', () => {
        showView('home');
    });
    
    // Filter buttons in watchlist
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
}

/**
 * Handle navigation between views
 */
function handleNavigation(e) {
    const targetView = e.target.dataset.view;
    showView(targetView);
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
    const selectedView = document.getElementById(`${viewName}-view`);
    selectedView.classList.add('active');
    
    // Highlight active nav button
    const activeNavBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Update current view
    currentView = viewName;
    
    // Load view-specific data
    if (viewName === 'watchlist') {
        renderWatchlist(currentFilter);
    }
}

/**
 * Handle search input
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        showError('Please enter a movie title');
        return;
    }
    
    // Clear previous results
    clearSearchResults();
    
    // Show loading state
    showLoading(true);
    
    // Perform search
    searchMovies(searchTerm);
}

/**
 * Handle filter changes in watchlist
 */
function handleFilter(e) {
    // Update active filter button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Get filter value
    const filter = e.target.dataset.filter;
    currentFilter = filter;
    
    // Re-render watchlist with filter
    renderWatchlist(filter);
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
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
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    const errorElement = document.getElementById('error-message');
    errorElement.classList.add('hidden');
}

// Export functions if needed (for testing or modular imports)
// In a production app, you might use ES6 modules