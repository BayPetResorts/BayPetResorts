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
    const sessionStart = Date.now();
    let lastActiveTime = sessionStart;
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

    // Send time spent events at intervals and on page unload
    function getTimeOnPage() {
        let currentActive = totalActiveTime;
        if (isActive) {
            currentActive += Date.now() - lastActiveTime;
        }
        return Math.round(currentActive / 1000); // Return seconds
    }

    // Send final time on page unload
    window.addEventListener('beforeunload', function() {
        const seconds = getTimeOnPage();
        const pagePath = window.location.pathname;
        const data = {
            event: 'TimeOnPageBeforeExiting',
            seconds: seconds,
            page: pagePath,
            page_name: getPageName(pagePath)
        };
        
        // Use sendBeacon for reliable delivery in beforeunload
        fbq('trackCustom', 'TimeOnPageBeforeExiting', data);
        
        // Send to server using sendBeacon (more reliable than fetch in beforeunload)
        const serverData = JSON.stringify({
            eventType: 'trackCustom',
            eventName: 'TimeOnPageBeforeExiting',
            eventData: data
        });
        navigator.sendBeacon('/api/meta-event', new Blob([serverData], { type: 'application/json' }));
    });


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
                    destination: href || 'none'
                };
                fbq('trackCustom', 'FooterClick', eventData);
                logMetaEvent('trackCustom', 'FooterClick', eventData);
            }
        }

        // Social media links
        if (href && (href.includes('facebook.com') || href.includes('instagram.com'))) {
            const eventData = {
                platform: href.includes('facebook') ? 'Facebook' : 'Instagram',
                source_page: window.location.pathname
            };
            fbq('trackCustom', 'SocialClick', eventData);
            logMetaEvent('trackCustom', 'SocialClick', eventData);
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
            fbq('track', 'Lead', formSubmittedData);
            logMetaEvent('track', 'Lead', formSubmittedData);
            // Note: CompleteRegistration fires from register.html AFTER URL changes to /thank-you
        }
    });

    // ============================================
    // 5. PAGE-SPECIFIC TRACKING
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
    // 6. ENGAGEMENT TRACKING
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
    // 7. OUTBOUND LINK TRACKING
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

        // Track external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            const eventData = {
                destination: href,
                source_page: window.location.pathname
            };
            fbq('trackCustom', 'OutboundLink', eventData);
            logMetaEvent('trackCustom', 'OutboundLink', eventData);
        }
    });

    console.log('Meta Pixel Advanced Tracking initialized');
})();
