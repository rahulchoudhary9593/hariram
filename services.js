document.addEventListener('DOMContentLoaded', () => {
    // Determine JSON path (handles both root and /hi/ subdirectories)
    const jsonPath = window.location.pathname.includes('/hi/') ? 'services-data.json' : 'services-data.json';

    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            renderServices(data);
            initCarousels();
            initModal();
        })
        .catch(error => console.error('Error loading services data:', error));
});

// --- RENDER DOM ---

function renderServices(sectionsData) {
    const container = document.getElementById('services-container');
    container.innerHTML = '';

    sectionsData.forEach((section, index) => {
        // Section wrapper
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'service-section';

        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end';
        
        const titleContainer = document.createElement('div');
        titleContainer.innerHTML = `<h2 class="text-3xl md:text-4xl font-bold font-heading text-dark flex items-center gap-3">
            <span class="w-8 h-1 bg-primary rounded-full hidden md:block"></span>
            ${section.section}
        </h2>`;
        
        const navContainer = document.createElement('div');
        navContainer.className = 'hidden md:flex gap-3';
        navContainer.innerHTML = `
            <button class="nav-btn nav-left w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-secondary hover:border-primary hover:text-primary hover:shadow-lg transition-all" data-target="carousel-${index}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button class="nav-btn nav-right w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-secondary hover:border-primary hover:text-primary hover:shadow-lg transition-all" data-target="carousel-${index}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        `;

        headerDiv.appendChild(titleContainer);
        headerDiv.appendChild(navContainer);

        // Carousel Viewport
        const viewportDiv = document.createElement('div');
        viewportDiv.className = 'carousel-viewport overflow-hidden w-full relative touch-pan-y cursor-grab';
        viewportDiv.id = `carousel-${index}`;
        
        const trackDiv = document.createElement('div');
        trackDiv.className = 'carousel-track flex gap-6 px-4 sm:px-6 lg:px-8 w-max py-4';

        // Generate Cards
        section.services.forEach(service => {
            const card = createCard(service);
            trackDiv.appendChild(card);
        });

        viewportDiv.appendChild(trackDiv);
        sectionDiv.appendChild(headerDiv);
        sectionDiv.appendChild(viewportDiv);
        container.appendChild(sectionDiv);
    });
}

function createCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden';
    
    // Store data in element for modal
    card.dataset.service = JSON.stringify(service);

    card.innerHTML = `
        <div class="service-image-container h-48 md:h-56 relative bg-gray-200">
            <img src="${service.thumbnail}" alt="${service.title}" class="w-full h-full object-cover" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-60"></div>
        </div>
        <div class="p-6 md:p-8 flex flex-col flex-grow">
            <h3 class="text-xl font-bold font-heading text-dark mb-3 line-clamp-2">${service.title}</h3>
            <p class="text-secondary text-sm mb-6 flex-grow line-clamp-3">${service.shortDescription}</p>
            <button class="view-details-btn group inline-flex items-center text-primary font-bold hover:text-yellow-600 transition-colors w-fit">
                View Details
                <svg class="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
        </div>
    `;

    // Click handler for modal
    card.querySelector('.view-details-btn').addEventListener('click', () => {
        openModal(service);
    });

    return card;
}

// --- CAROUSEL LOGIC ---

function initCarousels() {
    const viewports = document.querySelectorAll('.carousel-viewport');
    
    viewports.forEach(viewport => {
        const track = viewport.querySelector('.carousel-track');
        const originalCards = Array.from(track.children);
        
        if (originalCards.length === 0) return;

        // Safely determine how many clones are needed to loop smoothly.
        // Tailwind CDN compiles styles asynchronously, so scrollWidth might be 0 during DOMContentLoaded.
        // We use an estimated card width (300px) as a safe fallback.
        const estimatedCardWidth = 300;
        const targetWidth = window.innerWidth * 3;
        
        let currentWidth = track.scrollWidth;
        if (currentWidth === 0) {
            currentWidth = originalCards.length * estimatedCardWidth;
        }

        // Calculate replication count and clone only the ORIGINAL cards (O(N) instead of exponential O(2^N))
        let replicationCount = 0;
        if (currentWidth < targetWidth) {
            replicationCount = Math.ceil((targetWidth - currentWidth) / (originalCards.length * estimatedCardWidth));
            for (let i = 0; i < replicationCount; i++) {
                originalCards.forEach(card => {
                    const clone = card.cloneNode(true);
                    // Re-bind click event to clone
                    clone.querySelector('.view-details-btn').addEventListener('click', () => {
                        openModal(JSON.parse(clone.dataset.service));
                    });
                    track.appendChild(clone);
                });
            }
        }

        // State
        let position = 0;
        let speed = 1; // pixels per frame (60fps) -> approx 60px/sec
        let isPaused = false;
        let isDragging = false;
        let startX = 0;
        let prevTranslate = 0;
        let animationId;
        let idleTimeout;

        // Use ResizeObserver to dynamically update maxScroll when styles load, layout updates, or window resizes.
        // This avoids layout thrashing in requestAnimationFrame and ensures perfect scroll boundaries.
        let maxScroll = track.scrollWidth / 2 || (originalCards.length * estimatedCardWidth * (1 + replicationCount)) / 2;
        
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                maxScroll = entry.target.scrollWidth / 2;
            }
        });
        resizeObserver.observe(track);

        // Animation Loop
        function animate() {
            if (!isPaused && !isDragging) {
                position -= speed;
                
                // Reset loop if scrolled far enough (infinite effect)
                if (Math.abs(position) >= maxScroll) {
                    position = 0;
                }
                
                track.style.transform = `translateX(${position}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }

        // Start Animation
        animate();

        // Pause/Resume interactions
        const pause = () => { isPaused = true; };
        const resume = () => { 
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => { isPaused = false; }, 1000); // 1 sec delay before resume
        };

        viewport.addEventListener('mouseenter', pause);
        viewport.addEventListener('mouseleave', resume);
        viewport.addEventListener('touchstart', pause, {passive: true});
        viewport.addEventListener('touchend', resume, {passive: true});

        // Drag/Swipe Logic
        function dragStart(e) {
            isDragging = true;
            viewport.classList.add('is-dragging');
            startX = getPositionX(e);
            prevTranslate = position;
            cancelAnimationFrame(animationId);
        }

        function drag(e) {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            const diff = currentPosition - startX;
            position = prevTranslate + diff;
            track.style.transform = `translateX(${position}px)`;
        }

        function dragEnd() {
            isDragging = false;
            viewport.classList.remove('is-dragging');
            // Check boundary conditions and snap back if needed or let it continue
            if (position > 0) position = -maxScroll + 100; // dragged too far right, wrap left
            if (Math.abs(position) >= maxScroll) position = 0; // dragged too far left, wrap right
            
            animate();
            resume();
        }

        function getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }

        viewport.addEventListener('mousedown', dragStart);
        viewport.addEventListener('mousemove', drag);
        viewport.addEventListener('mouseup', dragEnd);
        viewport.addEventListener('mouseleave', () => { if(isDragging) dragEnd(); });

        viewport.addEventListener('touchstart', dragStart, {passive: true});
        viewport.addEventListener('touchmove', drag, {passive: true});
        viewport.addEventListener('touchend', dragEnd, {passive: true});

        // Navigation Arrows
        const parentSection = viewport.closest('.service-section');
        const navLeft = parentSection.querySelector('.nav-left');
        const navRight = parentSection.querySelector('.nav-right');

        if (navLeft) {
            navLeft.addEventListener('click', () => {
                pause();
                position += 350; // Scroll right (cards are ~300-380px wide)
                if (position > 0) position = -maxScroll + 350;
                track.style.transition = 'transform 0.4s ease-out';
                track.style.transform = `translateX(${position}px)`;
                setTimeout(() => { track.style.transition = 'none'; resume(); }, 400);
            });
        }
        if (navRight) {
            navRight.addEventListener('click', () => {
                pause();
                position -= 350; // Scroll left
                if (Math.abs(position) >= maxScroll) position = 0;
                track.style.transition = 'transform 0.4s ease-out';
                track.style.transform = `translateX(${position}px)`;
                setTimeout(() => { track.style.transition = 'none'; resume(); }, 400);
            });
        }
    });
}

// --- MODAL LOGIC ---

function initModal() {
    const modal = document.getElementById('service-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('.modal-dialog').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore body scroll
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function openModal(service) {
    const modal = document.getElementById('service-modal');
    
    // Populate Data
    document.getElementById('modal-title').textContent = service.title;
    document.getElementById('modal-description').textContent = service.fullDescription;
    
    // Features
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = '';
    service.features.forEach(feature => {
        const li = document.createElement('li');
        li.className = 'text-secondary font-medium check-list-item';
        li.textContent = feature;
        featuresList.appendChild(li);
    });

    // Applications
    const applicationsList = document.getElementById('modal-applications');
    applicationsList.innerHTML = '';
    service.applications.forEach(app => {
        const li = document.createElement('li');
        li.className = 'text-secondary font-medium dot-list-item';
        li.textContent = app;
        applicationsList.appendChild(li);
    });

    // Gallery
    setupModalGallery(service.gallery, service.title);

    // Show Modal
    modal.classList.remove('hidden');
    // Force reflow
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    modal.querySelector('.modal-dialog').classList.remove('scale-95');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
}

function setupModalGallery(images, altText) {
    const gallery = document.getElementById('modal-gallery');
    const indicatorsContainer = document.getElementById('gallery-indicators');
    const btnPrev = document.getElementById('gallery-prev');
    const btnNext = document.getElementById('gallery-next');
    
    gallery.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    images.forEach((imgSrc, index) => {
        // Image element
        const div = document.createElement('div');
        div.className = 'w-full h-full flex-shrink-0 snap-center';
        div.innerHTML = `<img src="${imgSrc}" alt="${altText} - Image ${index + 1}" class="w-full h-full object-cover">`;
        gallery.appendChild(div);

        // Indicator dot
        const dot = document.createElement('div');
        dot.className = `gallery-dot w-2 h-2 rounded-full cursor-pointer ${index === 0 ? 'active' : 'bg-gray-300'}`;
        dot.addEventListener('click', () => {
            gallery.scrollTo({ left: index * gallery.clientWidth, behavior: 'smooth' });
        });
        indicatorsContainer.appendChild(dot);
    });

    // Handle arrows visibility and clicks
    if (images.length > 1) {
        btnPrev.classList.remove('hidden');
        btnNext.classList.remove('hidden');
        
        btnPrev.onclick = () => {
            gallery.scrollBy({ left: -gallery.clientWidth, behavior: 'smooth' });
        };
        btnNext.onclick = () => {
            gallery.scrollBy({ left: gallery.clientWidth, behavior: 'smooth' });
        };

        // Scroll listener to update active dot and buttons state
        gallery.onscroll = () => {
            const scrollPos = gallery.scrollLeft;
            const width = gallery.clientWidth;
            const activeIndex = Math.round(scrollPos / width);
            
            // Update dots
            Array.from(indicatorsContainer.children).forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
                dot.classList.toggle('bg-gray-300', index !== activeIndex);
            });
            
            // Update buttons
            btnPrev.disabled = activeIndex === 0;
            btnNext.disabled = activeIndex === images.length - 1;
        };
        
        // Initial state
        btnPrev.disabled = true;
        btnNext.disabled = false;
    } else {
        btnPrev.classList.add('hidden');
        btnNext.classList.add('hidden');
        gallery.onscroll = null;
    }
}
