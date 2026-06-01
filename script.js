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

    window.toggleLang = function (lang) {
        const currentPath = window.location.pathname;
        const parts = currentPath.split('/');
        const filename = parts.pop();
        const targetFile = filename === '' ? 'index.html' : filename;

        const currentDir = parts[parts.length - 1];
        const isHindiDir = currentDir === 'hi';

        if (lang === 'hi' && !isHindiDir) {
            parts.push('hi', targetFile);
            window.location.href = parts.join('/');
        } else if (lang === 'en' && isHindiDir) {
            parts.pop(); // Remove 'hi' directory
            parts.push(targetFile);
            window.location.href = parts.join('/');
        }
    };

    // Website load hote hi Hindi open karo
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const currentDir = parts[parts.length - 2];

    if (currentDir !== 'hi') {
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
        const parts = window.location.pathname.split('/');
        const currentDir = parts[parts.length - 2] || '';
        const isHindi = currentDir === 'hi';
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



