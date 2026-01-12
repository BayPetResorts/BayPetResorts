// Bay Pet Resorts - Homepage Script
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Ensure video autoplays on mobile
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Set video properties for mobile compatibility
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');
        heroVideo.muted = true;
        
        // Function to attempt video playback
        const attemptPlay = () => {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented, try again after user interaction
                    const playOnInteraction = () => {
                        heroVideo.play().catch(() => {});
                        document.removeEventListener('touchstart', playOnInteraction);
                        document.removeEventListener('click', playOnInteraction);
                    };
                    document.addEventListener('touchstart', playOnInteraction, { once: true });
                    document.addEventListener('click', playOnInteraction, { once: true });
                });
            }
        };
        
        // Try to play immediately
        if (heroVideo.readyState >= 2) {
            attemptPlay();
        } else {
            heroVideo.addEventListener('loadeddata', attemptPlay, { once: true });
            heroVideo.addEventListener('canplay', attemptPlay, { once: true });
        }
        
        // Ensure video plays when it becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && heroVideo.paused) {
                    attemptPlay();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(heroVideo);
    }
});
