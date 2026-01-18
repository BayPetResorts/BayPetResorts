// Component Loader - Loads header and footer components
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('/components/header.html')
            .then(response => response.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                initializeHamburgerMenu();
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });
    }

    // Load footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('/components/footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading footer:', error);
            });
    }
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


