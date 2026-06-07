document.addEventListener('DOMContentLoaded', () => {
    // Relative path resolves to root folder or hi/ folder automatically
    const jsonPath = 'projects-data.json';

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            return response.json();
        })
        .then(data => {
            renderProjects(data);
        })
        .catch(error => console.error('Error loading projects:', error));
});

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    container.innerHTML = '';

    projects.forEach((project, projectIdx) => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2';
        
        const images = project.images && project.images.length > 0 ? project.images : [project.image];
        const hasMultiple = images.length > 1;

        let controlsHtml = '';
        if (hasMultiple) {
            controlsHtml = `
                <!-- Left Arrow -->
                <button class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-dark w-8 h-8 rounded-full flex items-center justify-center shadow-md md:opacity-0 md:group-hover/slider:opacity-100 opacity-100 transition-opacity duration-300 z-20 prev-btn" aria-label="Previous image">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <!-- Right Arrow -->
                <button class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-dark w-8 h-8 rounded-full flex items-center justify-center shadow-md md:opacity-0 md:group-hover/slider:opacity-100 opacity-100 transition-opacity duration-300 z-20 next-btn" aria-label="Next image">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
                <!-- Dot Indicators -->
                <div class="absolute top-4 right-4 flex space-x-1.5 z-20 indicators-container bg-dark/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                    ${images.map((_, idx) => `
                        <button class="w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-primary w-4' : 'bg-white/60 hover:bg-white'}" data-index="${idx}" aria-label="Go to image ${idx + 1}"></button>
                    `).join('')}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="relative h-64 overflow-hidden group/slider cursor-pointer image-slider-container" data-project-idx="${projectIdx}">
                <!-- Slider Track -->
                <div class="flex h-full transition-transform duration-500 ease-out slider-track" style="transform: translate3d(0, 0, 0); width: ${images.length * 100}%;">
                    ${images.map(imgSrc => `
                        <div class="w-full h-full flex-shrink-0 overflow-hidden" style="width: ${100 / images.length}%;">
                            <img src="${imgSrc}" alt="${project.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                        </div>
                    `).join('')}
                </div>
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/30 to-transparent pointer-events-none z-10"></div>
                <div class="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
                    <span class="inline-block px-3 py-1 bg-primary text-dark text-xs font-bold rounded-full mb-2 uppercase tracking-wide">${project.category}</span>
                    <h3 class="text-xl font-bold font-heading text-white">${project.title}</h3>
                </div>
                ${controlsHtml}
            </div>
            <div class="p-6">
                <div class="space-y-3 mb-6">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="text-secondary text-sm">${project.location}</span>
                    </div>
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        <span class="text-secondary text-sm">${project.scope}</span>
                    </div>
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-secondary text-sm">${project.client}</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);

        // Interactive Slider behavior
        if (hasMultiple) {
            let currentIdx = 0;
            let autoplayInterval = null;
            const sliderContainer = card.querySelector('.image-slider-container');
            const track = card.querySelector('.slider-track');
            const prevBtn = card.querySelector('.prev-btn');
            const nextBtn = card.querySelector('.next-btn');
            const dots = card.querySelectorAll('.indicators-container button');

            const updateSlider = (index) => {
                currentIdx = (index + images.length) % images.length;
                track.style.transform = `translate3d(-${currentIdx * (100 / images.length)}%, 0, 0)`;
                
                // Update dots styling
                dots.forEach((dot, idx) => {
                    if (idx === currentIdx) {
                        dot.className = 'w-4 h-2 rounded-full transition-all duration-300 bg-primary';
                    } else {
                        dot.className = 'w-2 h-2 rounded-full transition-all duration-300 bg-white/60 hover:bg-white';
                    }
                });
            };

            const startAutoplay = () => {
                stopAutoplay();
                autoplayInterval = setInterval(() => {
                    updateSlider(currentIdx + 1);
                }, 3500);
            };

            const stopAutoplay = () => {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
            };

            // Event Listeners for controls
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                updateSlider(currentIdx - 1);
                startAutoplay(); // Reset autoplay timer
            });

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                updateSlider(currentIdx + 1);
                startAutoplay(); // Reset autoplay timer
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
                    updateSlider(targetIdx);
                    startAutoplay(); // Reset autoplay timer
                });
            });

            // Pause on hover (Desktop)
            sliderContainer.addEventListener('mouseenter', stopAutoplay);
            sliderContainer.addEventListener('mouseleave', startAutoplay);

            // Touch support (Mobile swipe & touch pause)
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            sliderContainer.addEventListener('touchstart', (e) => {
                stopAutoplay();
                startX = e.touches[0].clientX;
                isDragging = true;
            }, { passive: true });

            sliderContainer.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
            }, { passive: true });

            sliderContainer.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                const diffX = startX - currentX;
                if (Math.abs(diffX) > 40) { // threshold of 40px
                    if (diffX > 0) {
                        updateSlider(currentIdx + 1);
                    } else {
                        updateSlider(currentIdx - 1);
                    }
                }
                isDragging = false;
                startAutoplay();
            });

            sliderContainer.addEventListener('touchcancel', () => {
                isDragging = false;
                startAutoplay();
            });

            // Initial start of autoplay
            startAutoplay();

            // Click on active area opens Lightbox Modal
            sliderContainer.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('.indicators-container')) {
                    return;
                }
                openLightbox(project, currentIdx);
            });
        } else {
            // For projects with only one image, click still opens Lightbox
            const sliderContainer = card.querySelector('.image-slider-container');
            sliderContainer.addEventListener('click', () => {
                openLightbox(project, 0);
            });
        }
    });
}

function openLightbox(project, initialIndex) {
    const images = project.images && project.images.length > 0 ? project.images : [project.image];
    let currentIdx = initialIndex;

    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className = 'fixed inset-0 z-[100] flex flex-col justify-between items-center bg-black/95 backdrop-blur-md py-6 px-4 md:px-10 opacity-0 pointer-events-none transition-opacity duration-300';
    
    // Disable background scroll
    document.body.classList.add('overflow-hidden');

    const renderDots = () => {
        if (images.length <= 1) return '';
        return `
            <div class="flex space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full select-none z-30">
                ${images.map((_, idx) => `
                    <button class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'bg-primary w-5' : 'bg-white/40 hover:bg-white'}" data-lightbox-index="${idx}"></button>
                `).join('')}
            </div>
        `;
    };

    modal.innerHTML = `
        <!-- Top bar: Title and Close Button -->
        <div class="w-full flex justify-between items-center max-w-7xl z-10">
            <div class="text-white">
                <span class="text-xs uppercase font-bold text-primary tracking-widest">${project.category}</span>
                <h4 class="text-lg md:text-xl font-bold font-heading">${project.title}</h4>
            </div>
            <button class="close-btn text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors duration-200" aria-label="Close Lightbox">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Middle area: Image & Nav Arrows -->
        <div class="relative w-full max-w-5xl flex items-center justify-center flex-grow py-4 select-none">
            <!-- Left Arrow -->
            ${images.length > 1 ? `
                <button class="prev-btn absolute left-2 md:left-4 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200" aria-label="Previous image">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <button class="next-btn absolute right-2 md:right-4 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200" aria-label="Next image">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            ` : ''}

            <!-- Active Image -->
            <img src="${images[currentIdx]}" alt="${project.title}" class="lightbox-img max-w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all duration-300 opacity-0 scale-95 select-none pointer-events-auto">
        </div>

        <!-- Bottom bar: Image counter and dot indicators -->
        <div class="w-full flex flex-col items-center gap-4 max-w-7xl pb-4 z-10">
            <span class="counter-text text-sm text-gray-400 font-medium">${currentIdx + 1} / ${images.length}</span>
            <div class="dots-wrapper">
                ${renderDots()}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fade in modal
    setTimeout(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        
        const img = modal.querySelector('.lightbox-img');
        img.classList.remove('opacity-0', 'scale-95');
        img.classList.add('opacity-100', 'scale-100');
    }, 10);

    const lightboxImg = modal.querySelector('.lightbox-img');
    const counterText = modal.querySelector('.counter-text');
    const dotsWrapper = modal.querySelector('.dots-wrapper');

    const updateLightboxImage = (newIdx) => {
        currentIdx = (newIdx + images.length) % images.length;
        
        // Soft transition on slide change
        lightboxImg.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            lightboxImg.src = images[currentIdx];
            counterText.textContent = `${currentIdx + 1} / ${images.length}`;
            
            // Re-render dots
            dotsWrapper.innerHTML = renderDots();
            
            // Re-bind dots event listeners
            bindDots();

            lightboxImg.classList.remove('opacity-0', 'scale-95');
            lightboxImg.classList.add('opacity-100', 'scale-100');
        }, 150);
    };

    const closeLightbox = () => {
        modal.classList.remove('opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
        
        // Remove scroll lock
        document.body.classList.remove('overflow-hidden');

        // Cleanup key listener
        window.removeEventListener('keydown', handleKeyDown);

        setTimeout(() => {
            modal.remove();
        }, 300);
    };

    // Controls event listeners
    if (images.length > 1) {
        modal.querySelector('.prev-btn').addEventListener('click', () => updateLightboxImage(currentIdx - 1));
        modal.querySelector('.next-btn').addEventListener('click', () => updateLightboxImage(currentIdx + 1));
    }

    modal.querySelector('.close-btn').addEventListener('click', closeLightbox);

    // Close on click outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('relative') || e.target.closest('.py-4') === e.target) {
            closeLightbox();
        }
    });

    const bindDots = () => {
        const lightboxDots = modal.querySelectorAll('.dots-wrapper button');
        lightboxDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetIdx = parseInt(dot.getAttribute('data-lightbox-index'), 10);
                updateLightboxImage(targetIdx);
            });
        });
    };
    bindDots();

    // Keyboard controls
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight' && images.length > 1) {
            updateLightboxImage(currentIdx + 1);
        } else if (e.key === 'ArrowLeft' && images.length > 1) {
            updateLightboxImage(currentIdx - 1);
        }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Mobile Swipe gestures for lightbox
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    modal.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    modal.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    }, { passive: true });

    modal.addEventListener('touchend', () => {
        if (!isDragging) return;
        const diffX = startX - currentX;
        if (Math.abs(diffX) > 50 && images.length > 1) {
            if (diffX > 0) {
                updateLightboxImage(currentIdx + 1);
            } else {
                updateLightboxImage(currentIdx - 1);
            }
        }
        isDragging = false;
    });
}
