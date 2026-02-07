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
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}">
        <div class="movie-card-content">
            <h3>${movie.Title}</h3>
            <div class="movie-card-info">
                <span>${movie.Year}</span>
                <span>${movie.Type}</span>
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
    
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    detailsContainer.innerHTML = `
        <div class="movie-details-content">
            <img src="${poster}" alt="${movie.Title}">
            <div class="movie-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Rating:</strong> ⭐ ${movie.imdbRating}/10</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Cast:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                
                <button id="add-to-watchlist-btn" class="btn ${inWatchlist ? 'btn-secondary' : 'btn-primary'}">
                    ${inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
            </div>
        </div>
    `;
    
    // Add watchlist button functionality
    const addBtn = document.getElementById('add-to-watchlist-btn');
    addBtn.addEventListener('click', () => {
        if (!inWatchlist) {
            addToWatchlist(movie);
            addBtn.textContent = '✓ In Watchlist';
            addBtn.className = 'btn btn-secondary';
        }
    });
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
    card.className = 'movie-card';
    
    const poster = movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/200x300?text=No+Poster';
    
    card.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <div class="movie-card-content">
            <h3>${movie.title}</h3>
            <div class="movie-card-info">
                <span>${movie.year}</span>
                <span>⭐ ${movie.imdbRating}</span>
            </div>
            <p>${movie.watched ? '✓ Watched' : 'Not watched yet'}</p>
            ${movie.userRating ? `<p>Your rating: ${'⭐'.repeat(movie.userRating)}</p>` : ''}
            <button class="btn btn-secondary remove-btn" data-id="${movie.imdbID}">Remove</button>
        </div>
    `;
    
    // Remove button functionality
    const removeBtn = card.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromWatchlist(movie.imdbID);
        renderWatchlist(currentFilter);
    });
    
    return card;
}