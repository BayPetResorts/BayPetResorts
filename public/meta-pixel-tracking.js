/**
 * Meta Pixel Advanced Event Tracking for Bay Pet Resorts
 * Tracks: Time on page, form submissions, page views, contact events
 */

(function() {
    'use strict';

    // Ensure fbq is available
    if (typeof fbq === 'undefined') {
        console.warn('Meta Pixel (fbq) not loaded. Tracking disabled.');
        return;
    }

    // Helper function to get readable page name
    function getPageName(path) {
        const pageNames = {
            '/': 'Homepage',
            '/register': 'Registration',
            '/doggie-daycare': 'Doggie Daycare',
            '/luxury-boarding': 'Luxury Boarding',
            '/meet-the-owners': 'Meet the Owners',
            '/contact': 'Contact',
            '/why-we-are-better': 'Why We\'re Better',
            '/thank-you': 'Thank You'
        };
        return pageNames[path] || path;
    }

    // Helper function to log Meta events to terminal (via server)
    function logMetaEvent(eventType, eventName, eventData) {
        // Log to browser console
        console.log(`📊 Meta Event: ${eventType}('${eventName}',`, eventData, ')');
        // Send to server to log in terminal
        fetch('/api/meta-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType: eventType,
                eventName: eventName,
                eventData: eventData
            })
        }).catch(() => {
            // Silently fail if server is not available
        });
    }

    // ============================================
    // 1. TIME ON PAGE TRACKING
    // ============================================
    let lastActiveTime = Date.now();
    let totalActiveTime = 0;
    let isActive = true;

    // Track active time (pause when tab is hidden)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Tab became hidden - save active time
            if (isActive) {
                totalActiveTime += Date.now() - lastActiveTime;
                isActive = false;
            }
        } else {
            // Tab became visible again
            lastActiveTime = Date.now();
            isActive = true;
        }
    });

    function getTimeOnPage() {
        let currentActive = totalActiveTime;
        if (isActive) {
            currentActive += Date.now() - lastActiveTime;
        }
        return Math.round(currentActive / 1000); // Return seconds
    }

    // Send final time on page unload
    const unloadProcessedKey = 'metaPixelUnloadProcessed';
    
    function handlePageUnload() {
        // Prevent duplicate firing using sessionStorage with timestamp
        const now = Date.now();
        const lastProcessed = sessionStorage.getItem(unloadProcessedKey);
        
        // If processed within last 100ms, skip (prevents duplicate pagehide events)
        if (lastProcessed && (now - parseInt(lastProcessed)) < 100) {
            return;
        }
        
        sessionStorage.setItem(unloadProcessedKey, now.toString());
        
        const pageSeconds = getTimeOnPage();
        const pagePath = window.location.pathname;
        
        // Page exit event
        const pageData = {
            event: 'TimeOnPageBeforeExiting',
            seconds: pageSeconds,
            page: pagePath,
            page_name: getPageName(pagePath)
        };
        
        // Use sendBeacon for reliable delivery
        fbq('trackCustom', 'TimeOnPageBeforeExiting', pageData);
        
        // Send to server using sendBeacon
        const pageServerData = JSON.stringify({
            eventType: 'trackCustom',
            eventName: 'TimeOnPageBeforeExiting',
            eventData: pageData
        });
        navigator.sendBeacon('/api/meta-event', new Blob([pageServerData], { type: 'application/json' }));
    }
    
    window.addEventListener('pagehide', handlePageUnload);
    
    // Clear the processed flag on page load to allow new unload events
    sessionStorage.removeItem(unloadProcessedKey);


    // ============================================
    // 2. CONTACT BUTTON TRACKING
    // ============================================
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        // Contact buttons
        if (target.classList.contains('contact-btn-phone') || target.closest('.contact-btn-phone')) {
            const eventData = {
                contact_type: 'phone'
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }

        if (target.classList.contains('contact-btn-email') || target.closest('.contact-btn-email')) {
            const eventData = {
                contact_type: 'email'
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }

        // Footer links
        if (target.closest('.footer-links') || target.closest('.main-footer')) {
            const linkText = target.textContent.trim();
            if (linkText) {
                const eventData = {
                    link_name: linkText,
                    destination: target.href || 'none'
                };
                fbq('trackCustom', 'FooterClick', eventData);
                logMetaEvent('trackCustom', 'FooterClick', eventData);
            }
        }

        // Social media links
        const href = target.href;
        if (href && (href.includes('facebook.com') || href.includes('instagram.com'))) {
            const eventData = {
                platform: href.includes('facebook') ? 'Facebook' : 'Instagram',
                source_page: window.location.pathname
            };
            fbq('trackCustom', 'SocialClick', eventData);
            logMetaEvent('trackCustom', 'SocialClick', eventData);
        }

        // Review links (Google and Yelp)
        if (target.classList.contains('review-link') || target.closest('.review-link')) {
            const reviewLink = target.closest('.review-link') || target;
            const reviewHref = reviewLink.href || target.href;
            
            let platform = null;
            if (reviewHref && reviewHref.includes('google.com') || reviewHref.includes('share.google')) {
                platform = 'Google';
            } else if (reviewHref && reviewHref.includes('yelp.com')) {
                platform = 'Yelp';
            }
            
            if (platform) {
                const eventData = {
                    platform: platform,
                    source_page: window.location.pathname
                };
                fbq('trackCustom', 'ReviewViewed', eventData);
                logMetaEvent('trackCustom', 'ReviewViewed', eventData);
            }
        }
    });

    // ============================================
    // 3. FORM SUBMISSION TRACKING (Registration Form)
    // ============================================
    // Listen for messages from the registration form iframe
    window.addEventListener('message', function(event) {
        // Only process messages from our domain
        if (event.origin !== window.location.origin && !event.origin.includes('baypetresorts.com')) {
            return;
        }

        const data = event.data;
        if (!data || !data.type) return;

        // Only track form submission
        if (data.type === 'formSubmitted') {
            const formSubmittedData = {
                content_name: 'Dog Registration Complete',
                content_category: 'Registration',
                services: data.services || []
            };
            
            // Track Lead event
            fbq('track', 'Lead', formSubmittedData);
            
            // Log to terminal using sendBeacon for reliability (in case page redirects immediately)
            const serverData = JSON.stringify({
                eventType: 'track',
                eventName: 'Lead',
                eventData: formSubmittedData
            });
            
            // Use sendBeacon for reliable delivery during navigation
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/meta-event', new Blob([serverData], { type: 'application/json' }));
            } else {
                // Fallback to fetch if sendBeacon not available
                logMetaEvent('track', 'Lead', formSubmittedData);
            }
            
            // Also log to console
            console.log(`📊 Meta Event: track('Lead',`, formSubmittedData, ')');
            
            // Note: CompleteRegistration fires from register.html AFTER URL changes to /thank-you
        }
    });

    // ============================================
    // 4. PAGE-SPECIFIC TRACKING
    // ============================================
    const pageName = window.location.pathname;

    // Track specific page views with more context
    const pageTracking = {
        '/luxury-boarding': { name: 'Luxury Boarding', category: 'Services' },
        '/doggie-daycare': { name: 'Doggie Daycare', category: 'Services' },
        '/why-we-are-better': { name: 'Why We\'re Better', category: 'Information' },
        '/meet-the-owners': { name: 'Meet the Owners', category: 'About' },
        '/contact': { name: 'Contact', category: 'Contact' },
        '/register': { name: 'Registration', category: 'Conversion' }
    };

    Object.keys(pageTracking).forEach(function(path) {
        if (pageName.includes(path.replace('/', ''))) {
            const info = pageTracking[path];
            const eventData = {
                content_name: info.name,
                content_category: info.category,
                content_type: 'page'
            };
            fbq('track', 'ViewContent', eventData);
            logMetaEvent('track', 'ViewContent', eventData);
        }
    });

    // ============================================
    // 5. ENGAGEMENT TRACKING
    // ============================================
    
    // Track testimonial section visibility
    const testimonialSection = document.querySelector('.testimonials-section');
    if (testimonialSection) {
        const testimonialObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const eventData = {
                        page: window.location.pathname
                    };
                    fbq('trackCustom', 'TestimonialsViewed', eventData);
                    logMetaEvent('trackCustom', 'TestimonialsViewed', eventData);
                    testimonialObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        testimonialObserver.observe(testimonialSection);
    }

    // Track promo banner interaction
    const promoBannerClose = document.getElementById('promoBannerClose');
    if (promoBannerClose) {
        promoBannerClose.addEventListener('click', function() {
            const eventData = {
                page: window.location.pathname
            };
            fbq('trackCustom', 'PromoBannerClosed', eventData);
            logMetaEvent('trackCustom', 'PromoBannerClosed', eventData);
        });
    }

    // ============================================
    // 6. PHONE AND EMAIL LINK TRACKING
    // ============================================
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Track phone calls
        if (href.startsWith('tel:')) {
            const eventData = {
                contact_type: 'phone_call',
                phone_number: href.replace('tel:', '')
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }

        // Track emails
        if (href.startsWith('mailto:')) {
            const eventData = {
                contact_type: 'email',
                email: href.replace('mailto:', '')
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }
    });

    console.log('Meta Pixel Advanced Tracking initialized');
})();
