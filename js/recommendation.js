// ===================================
// Movie Recommendations Engine
// ===================================

const RECS = {
    MIN: 6,
    MAX: 8,
    FAVORITE_TITLES_LIMIT: 2,
    RECENT_TITLES_LIMIT: 1,
    SIMILAR_PER_TITLE: 3,
    RECENT_TITLES_FETCH: 5
};

/**
 * Generate personalized movie recommendations
 * Based on user's watchlist, ratings, and favorite genres
 */
async function generateRecommendations() {
    const watchlist = getWatchlist();
    const watchlistArray = Object.values(watchlist);
    
    // If no watchlist, return popular movies
    if (watchlistArray.length === 0) {
        return await getPopularMovies();
    }
    
    // Analyze user preferences
    const preferences = analyzeUserPreferences(watchlistArray);
    
    // Get recommendations based on preferences
    const recommendations = await fetchRecommendations(preferences);
    
    return recommendations;
}

/**
 * Analyze user's movie preferences
 * @param {Array} watchlistMovies - Movies in user's watchlist
 * @returns {Object} User preferences
 */
function analyzeUserPreferences(watchlistMovies) {
    // Get favorite genres
    const genreCount = {};
    const highlyRatedMovies = [];
    const recentlyAddedMovies = [];
    
    watchlistMovies.forEach(movie => {
        // Count genres from highly rated movies (4+ stars)
        if (movie.userRating && movie.userRating >= 4) {
            highlyRatedMovies.push(movie);
        }
        
        // Get recently added movies (last 5)
        recentlyAddedMovies.push({
            title: movie.title,
            date: new Date(movie.addedDate)
        });
    });
    
    // Sort by date and get last 5
    recentlyAddedMovies.sort((a, b) => b.date - a.date);
    const recentTitles = recentlyAddedMovies.slice(0, RECS.RECENT_TITLES_FETCH).map(m => m.title);
    
    return {
        favoriteMovies: highlyRatedMovies.map(m => m.title),
        recentMovies: recentTitles,
        totalMovies: watchlistMovies.length
    };
}

/**
 * Helper: add unique movie objects from results into recommendations
 */
function addUniqueMovies(results = [], recommendations, seenIds, maxToAdd) {
    for (const m of results) {
        if (recommendations.length >= maxToAdd) break;
        if (m.Type !== 'movie') continue;
        if (seenIds.has(m.imdbID)) continue;
        recommendations.push(m);
        seenIds.add(m.imdbID);
    }
}

/**
 * Fetch movie recommendations based on preferences
 * @param {Object} preferences - User preferences
 * @returns {Array} Recommended movies
 */
async function fetchRecommendations(preferences) {
    const recommendations = [];
    const seenIds = new Set();

    const watchlist = getWatchlist();
    Object.keys(watchlist).forEach(id => seenIds.add(id));

    try {
        // From favorite movies
        if (preferences.favoriteMovies.length > 0) {
            const titles = preferences.favoriteMovies.slice(0, RECS.FAVORITE_TITLES_LIMIT);
            for (const title of titles) {
                if (recommendations.length >= RECS.MAX) break;
                const results = await searchMoviesByTitle(title);
                if (results && results.length) {
                    addUniqueMovies(results.slice(0, RECS.SIMILAR_PER_TITLE), recommendations, seenIds, RECS.MAX);
                }
            }
        }

        // From recent movies if still below MIN
        if (recommendations.length < RECS.MIN && preferences.recentMovies.length > 0) {
            const titles = preferences.recentMovies.slice(0, RECS.RECENT_TITLES_LIMIT);
            for (const title of titles) {
                if (recommendations.length >= RECS.MAX) break;
                const results = await searchMoviesByTitle(title);
                if (results && results.length) {
                    addUniqueMovies(results.slice(0, RECS.SIMILAR_PER_TITLE), recommendations, seenIds, RECS.MAX);
                }
            }
        }

        // Fill with popular movies if still below MIN
        if (recommendations.length < RECS.MIN) {
            const popular = await getPopularMovies();
            addUniqueMovies(popular, recommendations, seenIds, RECS.MAX);
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }

    return recommendations.slice(0, RECS.MAX);
}

/**
 * Search for movies by title (unchanged)
 * @param {string} title - Movie title
 * @returns {Array} Search results
 */
async function searchMoviesByTitle(title) {
    try {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}&type=movie`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'True') {
            return data.Search;
        }
        return [];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

/**
 * Get popular movies as fallback recommendations (unchanged)
 * @returns {Array} Popular movies
 */
async function getPopularMovies() {
    const popularSearchTerms = [
        'avengers', 'batman', 'star wars', 'matrix',
        'inception', 'interstellar', 'godfather', 'pulp fiction'
    ];

    const randomTerm = popularSearchTerms[Math.floor(Math.random() * popularSearchTerms.length)];

    try {
        const results = await searchMoviesByTitle(randomTerm);
        return results.slice(0, RECS.MAX);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

/**
 * Render recommendations section on home page (unchanged)
 */
async function renderRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-section');
    if (!recommendationsContainer) return;

    recommendationsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Finding movies for you...</p>
        </div>
    `;

    try {
        const recommendations = await generateRecommendations();

        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <p class="empty-state">No recommendations available. Add movies to your watchlist!</p>
            `;
            return;
        }

        const watchlist = getWatchlist();
        const hasWatchlist = Object.keys(watchlist).length > 0;

        recommendationsContainer.innerHTML = `
            <h2 class="section-heading">
                ${hasWatchlist ? '🎬 Recommended For You' : '🔥 Popular Movies'}
            </h2>
            <div class="recommendations-grid" id="recommendations-grid"></div>
        `;

        const grid = document.getElementById('recommendations-grid');
        recommendations.forEach(movie => {
            const card = createMovieCard(movie);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error rendering recommendations:', error);
        recommendationsContainer.innerHTML = `
            <p class="error-message">Could not load recommendations</p>
        `;
    }
}