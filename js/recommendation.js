// ===================================
// Movie Recommendations Engine
// ===================================

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
    const recentTitles = recentlyAddedMovies.slice(0, 5).map(m => m.title);
    
    return {
        favoriteMovies: highlyRatedMovies.map(m => m.title),
        recentMovies: recentTitles,
        totalMovies: watchlistMovies.length
    };
}

/**
 * Fetch movie recommendations based on preferences
 * @param {Object} preferences - User preferences
 * @returns {Array} Recommended movies
 */
async function fetchRecommendations(preferences) {
    const recommendations = [];
    const seenIds = new Set();
    
    // Get existing watchlist IDs to avoid duplicates
    const watchlist = getWatchlist();
    Object.keys(watchlist).forEach(id => seenIds.add(id));
    
    try {
        // Get recommendations based on favorite movies
        if (preferences.favoriteMovies.length > 0) {
            for (const movieTitle of preferences.favoriteMovies.slice(0, 2)) {
                const results = await searchMoviesByTitle(movieTitle);
                if (results && results.length > 0) {
                    // Get similar movies (same year range or related terms)
                    const similar = results.filter(m => 
                        !seenIds.has(m.imdbID) && m.Type === 'movie'
                    ).slice(0, 3);
                    
                    similar.forEach(movie => {
                        if (!seenIds.has(movie.imdbID)) {
                            recommendations.push(movie);
                            seenIds.add(movie.imdbID);
                        }
                    });
                }
            }
        }
        
        // If we still need more recommendations, add from recent movies
        if (recommendations.length < 6 && preferences.recentMovies.length > 0) {
            for (const movieTitle of preferences.recentMovies.slice(0, 1)) {
                const results = await searchMoviesByTitle(movieTitle);
                if (results && results.length > 0) {
                    const additional = results.filter(m => 
                        !seenIds.has(m.imdbID) && m.Type === 'movie'
                    ).slice(0, 3);
                    
                    additional.forEach(movie => {
                        if (!seenIds.has(movie.imdbID) && recommendations.length < 8) {
                            recommendations.push(movie);
                            seenIds.add(movie.imdbID);
                        }
                    });
                }
            }
        }
        
        // If still not enough, add popular movies
        if (recommendations.length < 6) {
            const popular = await getPopularMovies();
            popular.forEach(movie => {
                if (!seenIds.has(movie.imdbID) && recommendations.length < 8) {
                    recommendations.push(movie);
                    seenIds.add(movie.imdbID);
                }
            });
        }
        
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
    
    return recommendations.slice(0, 8);
}

/**
 * Search for movies by title (helper function)
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
 * Get popular movies as fallback recommendations
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
        return results.slice(0, 8);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

/**
 * Render recommendations section on home page
 */
async function renderRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-section');
    
    if (!recommendationsContainer) return;
    
    // Show loading
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