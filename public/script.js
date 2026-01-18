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
        
        let originalItemsCount;
        
        if (commentIndex !== -1 && allItems.length > 2) {
            // Count original items before comment
            const itemsBeforeComment = allNodes.slice(0, commentIndex)
                .filter(node => node.nodeType === 1 && node.classList.contains('testimonial-item')).length;
            
            const originalItemsArray = allItems.slice(0, itemsBeforeComment);
            const firstTwoItems = originalItemsArray.slice(0, 2);
            originalItemsCount = originalItemsArray.length;
            
            // Shuffle original items using Fisher-Yates algorithm
            for (let i = originalItemsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [originalItemsArray[i], originalItemsArray[j]] = [originalItemsArray[j], originalItemsArray[i]];
            }
            
            // Rebuild the track with shuffled items
            testimonialsTrack.innerHTML = '';
            originalItemsArray.forEach(item => testimonialsTrack.appendChild(item));
            
            // Add comment marker
            testimonialsTrack.appendChild(document.createComment(' Duplicate items for seamless loop '));
            
            // Add first 2 items as duplicates for seamless loop
            firstTwoItems.forEach(item => testimonialsTrack.appendChild(item.cloneNode(true)));
        } else {
            originalItemsCount = allItems.length;
        }
        
        let scrollPosition = 0;
        let isPaused = false;
        const scrollSpeed = 1.5; // pixels per frame
        const itemWidth = 350; // width of each testimonial item including gap (320px + 30px gap)
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
