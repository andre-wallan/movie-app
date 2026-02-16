// Simple player: creates modal (if missing), opens YouTube embed or external searches.

(function () {
    const MODAL_ID = 'player-modal';
    const IFRAME_ID = 'player-iframe';
    const BACKDROP_ID = 'player-backdrop';
    const CLOSE_ID = 'player-close';
    const HIDDEN_CLASS = 'hidden';

    function ensureModalExists() {
        if (document.getElementById(MODAL_ID)) return;

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = `modal ${HIDDEN_CLASS}`;
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-backdrop" id="${BACKDROP_ID}"></div>
            <div class="modal-content" role="dialog" aria-modal="true" aria-label="Video player">
                <button id="${CLOSE_ID}" class="modal-close" aria-label="Close player">✕</button>
                <div class="player-wrapper">
                    <iframe id="${IFRAME_ID}" src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function openTrailerModal(youtubeId, title = '') {
        ensureModalExists();
        const modal = document.getElementById(MODAL_ID);
        const iframe = document.getElementById(IFRAME_ID);

        if (!modal || !iframe) {
            // fallback to search if modal couldn't be created
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`, '_blank');
            return;
        }

        if (youtubeId) {
            // embed YouTube video with autoplay
            iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0&modestbranding=1`;
            modal.classList.remove(HIDDEN_CLASS);
            modal.setAttribute('aria-hidden', 'false');
            // prevent background scroll
            document.documentElement.style.overflow = 'hidden';
            // focus close button for accessibility
            const closeBtn = document.getElementById(CLOSE_ID);
            if (closeBtn) closeBtn.focus();
        } else {
            // open YouTube search for trailer
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`, '_blank');
        }
    }

    function closeTrailerModal() {
        const modal = document.getElementById(MODAL_ID);
        const iframe = document.getElementById(IFRAME_ID);
        if (iframe) iframe.src = '';
        if (modal) {
            modal.classList.add(HIDDEN_CLASS);
            modal.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.style.overflow = '';
    }

    function openExternalSearch(title = '') {
        const q = encodeURIComponent(`watch ${title} streaming`);
        window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener');
    }

    // Expose globally
    window.openTrailerModal = openTrailerModal;
    window.closeTrailerModal = closeTrailerModal;
    window.openExternalSearch = openExternalSearch;

    // Attach close handlers (delegated)
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;
        if (target.id === CLOSE_ID || target.id === BACKDROP_ID) {
            closeTrailerModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById(MODAL_ID);
            if (modal && !modal.classList.contains(HIDDEN_CLASS)) closeTrailerModal();
        }
    });
})();