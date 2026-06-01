document.addEventListener("DOMContentLoaded", () => {

    // Load Header
    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            initializeHeaderFunctions();
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Footer
    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
            const yearEl = document.getElementById('year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        })
        .catch(error => console.error('Error loading footer:', error));

    // Helper to check if current page is Hindi
    function isPageHindi() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0) return false;

        const lastSegment = segments[segments.length - 1];
        if (lastSegment === 'hi') return true;

        if (segments.length >= 2) {
            const parentSegment = segments[segments.length - 2];
            if (parentSegment === 'hi') return true;
        }
        return false;
    }

    window.toggleLang = function (lang) {
        // Save language preference to local storage
        localStorage.setItem('preferredLanguage', lang);

        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);

        // Find current filename
        let filename = 'index.html';
        if (segments.length > 0) {
            const last = segments[segments.length - 1];
            if (last !== 'hi') {
                filename = last.includes('.') ? last : 'index.html';
            }
        }

        let newPath = '';
        if (window.location.protocol === 'file:') {
            // Local file routing
            let baseSegments = [];
            const hiIndex = segments.indexOf('hi');
            if (hiIndex !== -1) {
                baseSegments = segments.slice(0, hiIndex);
            } else {
                baseSegments = segments.slice(0, segments.length - 1);
            }

            if (lang === 'hi') {
                newPath = '/' + [...baseSegments, 'hi', filename].join('/');
            } else {
                newPath = '/' + [...baseSegments, filename].join('/');
            }
        } else {
            // Web server (Vercel) routing
            if (lang === 'hi') {
                newPath = `/hi/${filename}`;
            } else {
                newPath = `/${filename}`;
            }
        }

        window.location.href = newPath;
    };

    // Website load hote hi preferred language open karo (default Hindi)
    const isHindi = isPageHindi();
    const preferredLanguage = localStorage.getItem('preferredLanguage');

    if (!isHindi && preferredLanguage !== 'en') {
        // Default to Hindi if user hasn't explicitly set preference to English
        localStorage.setItem('preferredLanguage', 'hi');
        toggleLang('hi');
        return;
    }

    function initializeHeaderFunctions() {
        // Highlight active link based on current page
        const currentPage = window.location.pathname.split("/").pop() || 'index.html';

        // Desktop Links
        const desktopLinks = document.querySelectorAll('.nav-link');
        desktopLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.remove('text-secondary');
                link.classList.add('text-primary');
            }
        });

        // Mobile Links
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.remove('text-secondary', 'hover:bg-gray-50');
                link.classList.add('text-primary', 'bg-gray-50');
            }
        });

        // Mobile Menu Toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', function () {
                const menu = document.getElementById('mobile-menu');
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    setTimeout(() => menu.classList.add('opacity-100', 'translate-y-0'), 10);
                } else {
                    menu.classList.add('hidden');
                }
            });
        }

        // Sticky Navbar background change on scroll
        window.addEventListener('scroll', function () {
            const nav = document.querySelector('nav');
            if (nav) {
                if (window.scrollY > 20) {
                    nav.classList.add('shadow-md');
                } else {
                    nav.classList.remove('shadow-md');
                }
            }
        });

        // Highlight Active Language Button
        const isHindi = isPageHindi();
        const btnEn = document.getElementById('lang-btn-en');
        const btnHi = document.getElementById('lang-btn-hi');
        const btnMobEn = document.getElementById('lang-btn-mob-en');
        const btnMobHi = document.getElementById('lang-btn-mob-hi');

        const activeClasses = ['bg-dark', 'text-white', 'shadow-sm'];
        const inactiveClasses = ['text-secondary', 'hover:text-dark'];

        if (isHindi) {
            if (btnHi) { btnHi.classList.add(...activeClasses); btnHi.classList.remove(...inactiveClasses); }
            if (btnMobHi) { btnMobHi.classList.add(...activeClasses); btnMobHi.classList.remove(...inactiveClasses); }
            if (btnEn) { btnEn.classList.add(...inactiveClasses); btnEn.classList.remove(...activeClasses); }
            if (btnMobEn) { btnMobEn.classList.add(...inactiveClasses); btnMobEn.classList.remove(...activeClasses); }
        } else {
            if (btnEn) { btnEn.classList.add(...activeClasses); btnEn.classList.remove(...inactiveClasses); }
            if (btnMobEn) { btnMobEn.classList.add(...activeClasses); btnMobEn.classList.remove(...inactiveClasses); }
            if (btnHi) { btnHi.classList.add(...inactiveClasses); btnHi.classList.remove(...activeClasses); }
            if (btnMobHi) { btnMobHi.classList.add(...inactiveClasses); btnMobHi.classList.remove(...activeClasses); }
        }
    }
});



