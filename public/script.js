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
    
    // Testimonials Auto-Scroll
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    const testimonialsContainer = document.querySelector('.testimonials-container');
    
    if (testimonialsTrack && testimonialsContainer) {
        // Randomize testimonials order (excluding duplicates)
        const allItems = Array.from(testimonialsTrack.querySelectorAll('.testimonial-item'));
        
        // Find comment node to separate original items from duplicates
        const allNodes = Array.from(testimonialsTrack.childNodes);
        const commentIndex = allNodes.findIndex(node => 
            node.nodeType === 8 && node.textContent.includes('Duplicate'));
        
        if (commentIndex !== -1 && allItems.length > 2) {
            // Count items before comment (original items)
            let itemsBeforeComment = 0;
            for (let i = 0; i < commentIndex; i++) {
                if (allNodes[i].nodeType === 1 && allNodes[i].classList.contains('testimonial-item')) {
                    itemsBeforeComment++;
                }
            }
            
            const originalItemsArray = allItems.slice(0, itemsBeforeComment);
            const firstTwoItems = originalItemsArray.slice(0, 2);
            
            // Shuffle original items using Fisher-Yates algorithm
            for (let i = originalItemsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [originalItemsArray[i], originalItemsArray[j]] = [originalItemsArray[j], originalItemsArray[i]];
            }
            
            // Rebuild the track with shuffled items
            testimonialsTrack.innerHTML = '';
            originalItemsArray.forEach(item => testimonialsTrack.appendChild(item));
            
            // Add comment
            const comment = document.createComment(' Duplicate items for seamless loop ');
            testimonialsTrack.appendChild(comment);
            
            // Add first 2 items as duplicates for seamless loop
            firstTwoItems.forEach(item => {
                const clone = item.cloneNode(true);
                testimonialsTrack.appendChild(clone);
            });
        }
        
        let scrollPosition = 0;
        let isPaused = false;
        const scrollSpeed = 1.5; // pixels per frame
        const itemWidth = 350; // width of each testimonial item including gap (320px + 30px gap)
        const totalItems = testimonialsTrack.querySelectorAll('.testimonial-item').length;
        const originalItemsCount = 30; // Number of original testimonials (before duplicates)
        const resetPoint = originalItemsCount * itemWidth;
        
        // Pause on hover (desktop)
        testimonialsContainer.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        
        testimonialsContainer.addEventListener('mouseleave', () => {
            isPaused = false;
        });
        
        // Pause on touch (mobile)
        let touchTimeout = null;
        
        testimonialsContainer.addEventListener('touchstart', () => {
            isPaused = true;
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
        });
        
        testimonialsContainer.addEventListener('touchend', () => {
            // Small delay before resuming to allow for scroll gestures
            touchTimeout = setTimeout(() => {
                isPaused = false;
            }, 500);
        });
        
        testimonialsContainer.addEventListener('touchmove', () => {
            isPaused = true;
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
        });
        
        // Auto-scroll animation
        function animate() {
            if (!isPaused) {
                scrollPosition += scrollSpeed;
                
                // Reset position when we've scrolled past all original items (seamless loop)
                if (scrollPosition >= resetPoint) {
                    scrollPosition = 0;
                }
                
                testimonialsTrack.style.transform = `translateX(-${scrollPosition}px)`;
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
});
