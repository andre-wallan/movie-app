// ===================================
// localStorage Management Functions
// ===================================

const WATCHLIST_KEY = 'movieWatchlist';

/**
 * Get watchlist from localStorage
 * @returns {Object} Watchlist object with movie IDs as keys
 */
function getWatchlist() {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : {};
}

/**
 * Save watchlist to localStorage
 * @param {Object} watchlist - Watchlist object to save
 */
function saveWatchlist(watchlist) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
}

/**
 * Add movie to watchlist
 * @param {Object} movie - Movie object from API
 */
function addToWatchlist(movie) {
    const watchlist = getWatchlist();
    
    watchlist[movie.imdbID] = {
        imdbID: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        imdbRating: movie.imdbRating || 'N/A',
        addedDate: new Date().toISOString(),
        watched: false,
        userRating: null,
        userReview: ''
    };
    
    saveWatchlist(watchlist);
    console.log(`Added "${movie.Title}" to watchlist`);
}

/**
 * Remove movie from watchlist
 * @param {string} imdbID - IMDb ID of movie to remove
 */
function removeFromWatchlist(imdbID) {
    const watchlist = getWatchlist();
    delete watchlist[imdbID];
    saveWatchlist(watchlist);
    console.log(`Removed movie ${imdbID} from watchlist`);
}

/**
 * Mark movie as watched or unwatched
 * @param {string} imdbID - IMDb ID of the movie
 * @param {boolean} isWatched - Watched status
 */
function markAsWatched(imdbID, isWatched) {
    const watchlist = getWatchlist();
    if (watchlist[imdbID]) {
        watchlist[imdbID].watched = isWatched;
        saveWatchlist(watchlist);
        console.log(`Marked movie ${imdbID} as ${isWatched ? 'watched' : 'unwatched'}`);
    }
}

/**
 * Save user rating for a movie
 * @param {string} imdbID - IMDb ID of the movie
 * @param {number} rating - Rating value (1-5)
 */
function saveRating(imdbID, rating) {
    const watchlist = getWatchlist();
    if (watchlist[imdbID]) {
        watchlist[imdbID].userRating = rating;
        saveWatchlist(watchlist);
        console.log(`Saved rating ${rating} for movie ${imdbID}`);
    }
}

/**
 * Save user review for a movie
 * @param {string} imdbID - IMDb ID of the movie
 * @param {string} review - Review text
 */
function saveReview(imdbID, review) {
    const watchlist = getWatchlist();
    if (watchlist[imdbID]) {
        watchlist[imdbID].userReview = review;
        saveWatchlist(watchlist);
        console.log(`Saved review for movie ${imdbID}`);
    }
}

/**
 * Check if movie is in watchlist
 * @param {string} imdbID - IMDb ID to check
 * @returns {boolean} True if movie is in watchlist
 */
function isInWatchlist(imdbID) {
    const watchlist = getWatchlist();
    return watchlist.hasOwnProperty(imdbID);
}

/**
 * Get all watched movies
 * @returns {Array} Array of watched movies
 */
function getWatchedMovies() {
    const watchlist = getWatchlist();
    return Object.values(watchlist).filter(movie => movie.watched);
}

/**
 * Get all unwatched movies
 * @returns {Array} Array of unwatched movies
 */
function getUnwatchedMovies() {
    const watchlist = getWatchlist();
    return Object.values(watchlist).filter(movie => !movie.watched);
}

/**
 * Get watchlist as array
 * @returns {Array} Array of all movies in watchlist
 */
function getWatchlistArray() {
    const watchlist = getWatchlist();
    return Object.values(watchlist);
}