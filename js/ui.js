// ===================================
// UI Rendering Functions
// ===================================

/**
 * Render search results to the DOM
 * @param {Array} movies - Array of movie objects from API
 */
function renderSearchResults(movies) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (!movies || movies.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-state">No movies found</p>';
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        resultsContainer.appendChild(movieCard);
    });
}

/**
 * Create a movie card element
 * @param {Object} movie - Movie object
 * @returns {HTMLElement} Movie card element
 */
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Use placeholder if no poster
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/2f2f2f/b3b3b3?text=No+Poster';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" loading="lazy">
        <div class="movie-card-content">
            <h3>${movie.Title}</h3>
            <div class="movie-card-info">
                <span>${movie.Year}</span>
                <span class="movie-type">${movie.Type}</span>
            </div>
        </div>
    `;
    
    // Click to view details
    card.addEventListener('click', () => {
        getMovieDetails(movie.imdbID);
        showView('details');
    });
    
    return card;
}

/**
 * Render movie details view
 * @param {Object} movie - Detailed movie object from API
 */
function renderMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details');
    const inWatchlist = isInWatchlist(movie.imdbID);
    
    // Get user data if movie is in watchlist
    const watchlistData = inWatchlist ? getWatchlist()[movie.imdbID] : null;
    
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/2f2f2f/b3b3b3?text=No+Poster';
    
    detailsContainer.innerHTML = `
        <div class="movie-details-container">
            <div class="movie-details-poster">
                <img src="${poster}" alt="${movie.Title}">
            </div>
            
            <div class="movie-details-info">
                <h1 class="movie-details-title">${movie.Title} <span class="year">(${movie.Year})</span></h1>
                
                <div class="movie-meta">
                    <span class="rating">⭐ ${movie.imdbRating}/10</span>
                    <span class="rated">${movie.Rated}</span>
                    <span class="runtime">${movie.Runtime}</span>
                </div>
                
                <div class="movie-genre">${movie.Genre}</div>
                
                <div class="movie-actions">
                    <button id="watchlist-toggle-btn" class="btn ${inWatchlist ? 'btn-secondary' : 'btn-primary'}">
                        ${inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                    </button>
                    
                    ${inWatchlist ? `
                        <button id="watched-toggle-btn" class="btn ${watchlistData.watched ? 'btn-success' : 'btn-secondary'}">
                            ${watchlistData.watched ? '✓ Watched' : 'Mark as Watched'}
                        </button>
                    ` : ''}
                </div>
                
                <div class="movie-details-section">
                    <h3>Plot</h3>
                    <p>${movie.Plot}</p>
                </div>
                
                <div class="movie-details-section">
                    <h3>Details</h3>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Writer:</strong> ${movie.Writer}</p>
                    <p><strong>Actors:</strong> ${movie.Actors}</p>
                    <p><strong>Language:</strong> ${movie.Language}</p>
                    <p><strong>Country:</strong> ${movie.Country}</p>
                    ${movie.Awards !== 'N/A' ? `<p><strong>Awards:</strong> ${movie.Awards}</p>` : ''}
                </div>
                
                ${inWatchlist ? `
                    <div class="movie-details-section user-section">
                        <h3>Your Rating</h3>
                        <div class="star-rating" id="star-rating">
                            ${createStarRating(watchlistData.userRating)}
                        </div>
                        
                        <h3>Your Review</h3>
                        <textarea 
                            id="user-review" 
                            class="review-textarea" 
                            placeholder="Write your thoughts about this movie..."
                            rows="4"
                        >${watchlistData.userReview || ''}</textarea>
                        <button id="save-review-btn" class="btn btn-primary">Save Review</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Set up event listeners
    setupDetailsEventListeners(movie, inWatchlist, watchlistData);
}

/**
 * Create star rating HTML
 * @param {number|null} currentRating - Current rating value
 * @returns {string} Star rating HTML
 */
function createStarRating(currentRating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        const filled = currentRating && i <= currentRating;
        starsHTML += `<span class="star ${filled ? 'filled' : ''}" data-rating="${i}">★</span>`;
    }
    return starsHTML;
}

/**
 * Set up event listeners for details page
 * @param {Object} movie - Movie object
 * @param {boolean} inWatchlist - Whether movie is in watchlist
 * @param {Object|null} watchlistData - Watchlist data if exists
 */
function setupDetailsEventListeners(movie, inWatchlist, watchlistData) {
    // Watchlist toggle button
    const watchlistBtn = document.getElementById('watchlist-toggle-btn');
    watchlistBtn.addEventListener('click', () => {
        if (inWatchlist) {
            // Remove from watchlist
            removeFromWatchlist(movie.imdbID);
            // Re-render details page
            getMovieDetails(movie.imdbID);
        } else {
            // Add to watchlist
            addToWatchlist(movie);
            // Re-render details page
            getMovieDetails(movie.imdbID);
        }
    });
    
    // Watched toggle button (if in watchlist)
    if (inWatchlist) {
        const watchedBtn = document.getElementById('watched-toggle-btn');
        if (watchedBtn) {
            watchedBtn.addEventListener('click', () => {
                const newWatchedStatus = !watchlistData.watched;
                markAsWatched(movie.imdbID, newWatchedStatus);
                // Re-render details page
                getMovieDetails(movie.imdbID);
            });
        }
        
        // Star rating
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                saveRating(movie.imdbID, rating);
                // Update star display
                stars.forEach(s => {
                    const starRating = parseInt(s.dataset.rating);
                    s.classList.toggle('filled', starRating <= rating);
                });
            });
        });
        
        // Save review button
        const saveReviewBtn = document.getElementById('save-review-btn');
        if (saveReviewBtn) {
            saveReviewBtn.addEventListener('click', () => {
                const reviewText = document.getElementById('user-review').value;
                saveReview(movie.imdbID, reviewText);
                showNotification('Review saved!');
            });
        }
    }
}

/**
 * Render watchlist with optional filter
 * @param {string} filter - Filter type: 'all', 'watched', 'unwatched'
 */
function renderWatchlist(filter = 'all') {
    const watchlistContainer = document.getElementById('watchlist-grid');
    const emptyState = document.getElementById('empty-watchlist');
    
    let movies;
    if (filter === 'watched') {
        movies = getWatchedMovies();
    } else if (filter === 'unwatched') {
        movies = getUnwatchedMovies();
    } else {
        movies = getWatchlistArray();
    }
    
    // Show empty state if no movies
    if (movies.length === 0) {
        watchlistContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    watchlistContainer.innerHTML = '';
    
    // Sort by added date (newest first)
    movies.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    
    movies.forEach(movie => {
        const card = createWatchlistCard(movie);
        watchlistContainer.appendChild(card);
    });
}

/**
 * Create a watchlist card element
 * @param {Object} movie - Movie object from watchlist
 * @returns {HTMLElement} Watchlist card element
 */
function createWatchlistCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card watchlist-card';
    
    const poster = movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/300x450/2f2f2f/b3b3b3?text=No+Poster';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.title}" loading="lazy">
        <div class="movie-card-content">
            <h3>${movie.title}</h3>
            <div class="movie-card-info">
                <span>${movie.year}</span>
                <span>⭐ ${movie.imdbRating}</span>
            </div>
            <div class="watchlist-status">
                ${movie.watched ? 
                    '<span class="status-badge watched">✓ Watched</span>' : 
                    '<span class="status-badge unwatched">To Watch</span>'
                }
                ${movie.userRating ? 
                    `<span class="user-rating">You: ${'⭐'.repeat(movie.userRating)}</span>` : 
                    ''
                }
            </div>
            <div class="card-actions">
                <button class="btn btn-small btn-primary view-btn" data-id="${movie.imdbID}">View Details</button>
                <button class="btn btn-small btn-danger remove-btn" data-id="${movie.imdbID}">Remove</button>
            </div>
        </div>
    `;
    
    // View button
    const viewBtn = card.querySelector('.view-btn');
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        getMovieDetails(movie.imdbID);
        showView('details');
    });
    
    // Remove button
    const removeBtn = card.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Remove "${movie.title}" from watchlist?`)) {
            removeFromWatchlist(movie.imdbID);
            renderWatchlist(currentFilter);
            showNotification('Removed from watchlist');
        }
    });
    
    return card;
}

/**
 * Show a temporary notification
 * @param {string} message - Notification message
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}