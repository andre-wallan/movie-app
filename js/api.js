// ===================================
// API Functions for OMDb
// ===================================

// IMPORTANT: Replace with your actual API key from OMDb
const API_KEY = '8c1a8b46';
const API_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Search for movies by title
 * @param {string} searchTerm - Movie title to search for
 */
async function searchMovies(searchTerm) {
    try {
        // Validate API key
        if (!checkApiKey()) {
            showError('Please configure your API key in api.js');
            showLoading(false);
            return;
        }

        const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie`;
        
        console.log('Searching for:', searchTerm);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Hide loading
        showLoading(false);
        
        if (data.Response === 'True') {
            console.log('Found', data.Search.length, 'movies');
            // Render search results
            renderSearchResults(data.Search);
        } else {
            // Show error message
            showError(data.Error || 'No movies found. Try a different search term.');
            clearSearchResults();
        }
    } catch (error) {
        showLoading(false);
        showError('Failed to fetch movies. Please check your internet connection.');
        console.error('Search error:', error);
    }
}

/**
 * Get detailed information about a specific movie
 * @param {string} imdbID - IMDb ID of the movie
 */
async function getMovieDetails(imdbID) {
    try {
        // Validate API key
        if (!checkApiKey()) {
            showError('Please configure your API key in api.js');
            return;
        }

        // Show loading in details view
        const detailsContainer = document.getElementById('movie-details');
        detailsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading movie details...</p></div>';

        const url = `${API_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        
        console.log('Fetching details for:', imdbID);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            console.log('Movie details loaded:', data.Title);
            // Render movie details
            renderMovieDetails(data);
        } else {
            detailsContainer.innerHTML = `<div class="error-message">Failed to load movie details</div>`;
        }
    } catch (error) {
        const detailsContainer = document.getElementById('movie-details');
        detailsContainer.innerHTML = `<div class="error-message">Failed to fetch movie details. Please try again.</div>`;
        console.error('Details error:', error);
    }
}

/**
 * Check if API key is configured
 */
function checkApiKey() {
    if (API_KEY === 'http://www.omdbapi.com/?i=tt3896198&apikey=8c1a8b46' || API_KEY === '') {
        console.error('⚠️ API key not configured!');
        console.log('Get your free API key at: https://www.omdbapi.com/apikey.aspx');
        return false;
    }
    return true;
}

// Check API key on load
if (!checkApiKey()) {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('⚠️  OMDb API KEY REQUIRED');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('1. Visit: https://www.omdbapi.com/apikey.aspx');
    console.warn('2. Select FREE plan and enter your email');
    console.warn('3. Check your email for activation');
    console.warn('4. Copy your API key');
    console.warn('5. Paste it in js/api.js (line 7)');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function fetchYouTubeId(title) {
    const key = 'YOUR_YOUTUBE_API_KEY';
    const q = encodeURIComponent(title + ' trailer');
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&key=${key}&type=video&maxResults=1`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.items && data.items.length) {
            return data.items[0].id.videoId;
        }
    } catch (err) {
        console.error('YouTube fetch error:', err);
    }
    return null;
}