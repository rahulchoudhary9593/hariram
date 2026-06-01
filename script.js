document.addEventListener("DOMContentLoaded", () => {

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

    const isHindi = isPageHindi();

    // Determine base paths dynamically for both local file:/// and Vercel domains
    let basePath = '';
    if (window.location.protocol === 'file:') {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        const hiIndex = segments.indexOf('hi');
        let baseSegments = [];
        if (hiIndex !== -1) {
            baseSegments = segments.slice(0, hiIndex);
        } else {
            baseSegments = segments.slice(0, segments.length - 1);
        }
        basePath = '/' + baseSegments.join('/') + '/';
    } else {
        basePath = '/';
    }

    const langBase = isHindi ? `${basePath}hi/` : basePath;

    // Helper to clean file names for link comparison
    function getCleanPageName(path) {
        const name = path.split('/').pop() || 'index';
        if (name === 'hi' || name === '') return 'index';
        return name.replace('.html', '');
    }

    // Function to update all local links on the page to match active language structure
    function updateAllPageLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
                return;
            }

            const filename = href.split('/').pop();
            let targetHref = langBase + filename;

            if (window.location.protocol !== 'file:') {
                // Strip .html extension on web servers for clean URLs
                targetHref = targetHref.replace('.html', '');
                if (targetHref.endsWith('/index')) {
                    targetHref = targetHref.slice(0, -5);
                }
                if (targetHref.endsWith('/hi/')) {
                    targetHref = targetHref.slice(0, -1);
                }
                if (targetHref === '') {
                    targetHref = '/';
                }
            }
            link.setAttribute('href', targetHref);
        });
    }

    window.toggleLang = function (lang) {
        localStorage.setItem('preferredLanguage', lang);

        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);

        // Find current filename
        let filename = 'index.html';
        if (segments.length > 0) {
            const last = segments[segments.length - 1];
            if (last !== 'hi') {
                filename = last.includes('.') ? last : (last + '.html');
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
            // Strip .html for clean urls
            newPath = newPath.replace('.html', '');
            if (newPath.endsWith('/index')) {
                newPath = newPath.slice(0, -5);
            }
            if (newPath.endsWith('/hi/')) {
                newPath = newPath.slice(0, -1);
            }
            if (newPath === '') {
                newPath = '/';
            }
        }

        window.location.href = newPath;
    };

    // Website load hote hi preferred language open karo (default Hindi)
    const preferredLanguage = localStorage.getItem('preferredLanguage');

    if (!isHindi && preferredLanguage !== 'en') {
        // Default to Hindi if user hasn't explicitly set preference to English
        localStorage.setItem('preferredLanguage', 'hi');
        toggleLang('hi');
        return;
    }

    // Dynamic headers and footers path selection
    const headerUrl = isHindi ? `${basePath}hi/header.html` : `${basePath}header.html`;
    const footerUrl = isHindi ? `${basePath}hi/footer.html` : `${basePath}footer.html`;

    // Load Header
    fetch(headerUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            updateAllPageLinks(); // Update header links immediately
            initializeHeaderFunctions();
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Footer
    fetch(footerUrl)
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
            updateAllPageLinks(); // Update footer links immediately
        })
        .catch(error => console.error('Error loading footer:', error));

    // Update body links that already exist in HTML
    updateAllPageLinks();

    function initializeHeaderFunctions() {
        const currentPageName = getCleanPageName(window.location.pathname);

        // Desktop Links active class highlighting
        const desktopLinks = document.querySelectorAll('.nav-link');
        desktopLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const linkPageName = getCleanPageName(href);
                if (linkPageName === currentPageName) {
                    link.classList.remove('text-secondary');
                    link.classList.add('text-primary');
                } else {
                    link.classList.add('text-secondary');
                    link.classList.remove('text-primary');
                }
            }
        });

        // Mobile Links active class highlighting
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const linkPageName = getCleanPageName(href);
                if (linkPageName === currentPageName) {
                    link.classList.remove('text-secondary', 'hover:bg-gray-50');
                    link.classList.add('text-primary', 'bg-gray-50');
                } else {
                    link.classList.add('text-secondary', 'hover:bg-gray-50');
                    link.classList.remove('text-primary', 'bg-gray-50');
                }
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
