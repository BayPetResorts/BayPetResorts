// Component Loader - Loads header and footer components
function loadComponent(elementId, componentPath, callback) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    fetch(componentPath)
        .then(response => response.text())
        .then(html => {
            placeholder.innerHTML = html;
            if (callback) callback();
        })
        .catch(error => {
            console.error(`Error loading ${componentPath}:`, error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header-placeholder', '/components/header.html', initializeHamburgerMenu);
    loadComponent('footer-placeholder', '/components/footer.html');
});

// Initialize hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    const navOverlay = document.getElementById('nav-overlay');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    
    if (hamburgerBtn && mainNav) {
        function toggleMenu() {
            const isActive = mainNav.classList.contains('active');
            mainNav.classList.toggle('active');
            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }
            document.body.classList.toggle('menu-open', !isActive);
            document.body.style.overflow = !isActive ? 'hidden' : '';
        }

        function closeMenu() {
            mainNav.classList.remove('active');
            if (navOverlay) {
                navOverlay.classList.remove('active');
            }
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }

        // Toggle menu on hamburger click
        hamburgerBtn.addEventListener('click', toggleMenu);

        // Close menu when clicking on close button
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', closeMenu);
        }

        // Close menu when clicking on overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }

        // Close menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('.nav-link, .dropdown-item');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu on window resize if it's larger than mobile
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }
}
