// ===================================
// API Functions for OMDb
// ===================================

// IMPORTANT: Replace with your actual API key from OMDb
const API_KEY = 'your_api_key_here';
const API_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Search for movies by title
 * @param {string} searchTerm - Movie title to search for
 */
async function searchMovies(searchTerm) {
    try {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Hide loading
        showLoading(false);
        
        if (data.Response === 'True') {
            // Render search results
            renderSearchResults(data.Search);
        } else {
            // Show error message
            showError(data.Error || 'No movies found');
        }
    } catch (error) {
        showLoading(false);
        showError('Failed to fetch movies. Please try again.');
        console.error('Search error:', error);
    }
}

/**
 * Get detailed information about a specific movie
 * @param {string} imdbID - IMDb ID of the movie
 */
async function getMovieDetails(imdbID) {
    try {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Render movie details
            renderMovieDetails(data);
        } else {
            showError('Failed to load movie details');
        }
    } catch (error) {
        showError('Failed to fetch movie details. Please try again.');
        console.error('Details error:', error);
    }
}

/**
 * Check if API key is configured
 */
function checkApiKey() {
    if (API_KEY === 'your_api_key_here') {
        console.warn('⚠️ Please add your OMDb API key in api.js');
        return false;
    }
    return true;
}

// Check API key on load
checkApiKey();