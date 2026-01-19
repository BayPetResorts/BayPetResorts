/**
 * Meta Pixel Advanced Event Tracking for Bay Pet Resorts
 * Tracks: Time on site, button clicks, form interactions, navigation, scroll depth
 */

(function() {
    'use strict';

    // Ensure fbq is available
    if (typeof fbq === 'undefined') {
        console.warn('Meta Pixel (fbq) not loaded. Tracking disabled.');
        return;
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
    // 1. TIME ON SITE TRACKING
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
    function getTimeOnSite() {
        let currentActive = totalActiveTime;
        if (isActive) {
            currentActive += Date.now() - lastActiveTime;
        }
        return Math.round(currentActive / 1000); // Return seconds
    }

    // Track time milestones
    const timeMilestones = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min
    const achievedMilestones = new Set();

    setInterval(function() {
        const seconds = getTimeOnSite();
        timeMilestones.forEach(function(milestone) {
            if (seconds >= milestone && !achievedMilestones.has(milestone)) {
                achievedMilestones.add(milestone);
                const eventData = {
                    seconds: milestone,
                    milestone: milestone + 's',
                    page: window.location.pathname
                };
                fbq('trackCustom', 'TimeOnSite', eventData);
                logMetaEvent('trackCustom', 'TimeOnSite', eventData);
            }
        });
    }, 5000); // Check every 5 seconds

    // Send final time on page unload
    window.addEventListener('beforeunload', function() {
        const seconds = getTimeOnSite();
        if (seconds > 5) { // Only track if they stayed more than 5 seconds
            // Use sendBeacon for reliable delivery
            const data = {
                event: 'TimeOnSiteExit',
                seconds: seconds,
                page: window.location.pathname
            };
            // fbq might not work in beforeunload, so we also use navigator.sendBeacon
            fbq('trackCustom', 'TimeOnSiteExit', data);
            logMetaEvent('trackCustom', 'TimeOnSiteExit', data);
        }
    });

    // ============================================
    // 2. BUTTON CLICK TRACKING
    // ============================================
    function trackButtonClick(buttonName, buttonType, destination) {
        const eventData = {
            button_name: buttonName,
            button_type: buttonType,
            destination: destination || 'none',
            page: window.location.pathname
        };
        fbq('trackCustom', 'ButtonClick', eventData);
        logMetaEvent('trackCustom', 'ButtonClick', eventData);
    }

    // Track hero buttons (Boarding & Daycare)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        // Hero Boarding Button
        if (target.classList.contains('btn-boarding') || target.closest('.btn-boarding')) {
            trackButtonClick('Boarding', 'hero_cta', '/register');
            const eventData = {
                content_name: 'Boarding Service',
                content_category: 'Services',
                content_type: 'service'
            };
            fbq('track', 'ViewContent', eventData);
            logMetaEvent('track', 'ViewContent', eventData);
        }

        // Hero Daycare Button
        if (target.classList.contains('btn-daycare') || target.closest('.btn-daycare')) {
            trackButtonClick('Daycare', 'hero_cta', '/register');
            const eventData = {
                content_name: 'Daycare Service',
                content_category: 'Services',
                content_type: 'service'
            };
            fbq('track', 'ViewContent', eventData);
            logMetaEvent('track', 'ViewContent', eventData);
        }

        // Contact buttons
        if (target.classList.contains('contact-btn-phone') || target.closest('.contact-btn-phone')) {
            trackButtonClick('Call Us', 'contact', 'tel');
            const eventData = {
                contact_type: 'phone'
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }

        if (target.classList.contains('contact-btn-email') || target.closest('.contact-btn-email')) {
            trackButtonClick('Email Us', 'contact', 'mailto');
            const eventData = {
                contact_type: 'email'
            };
            fbq('track', 'Contact', eventData);
            logMetaEvent('track', 'Contact', eventData);
        }

        // Navigation links
        const navLinks = {
            'luxury-boarding': 'Luxury Boarding',
            'doggie-daycare': 'Doggie Daycare', 
            'why-we-are-better': 'Why We\'re Better',
            'meet-the-owners': 'Meet the Owners',
            'contact': 'Contact',
            'register': 'Register'
        };

        const href = target.getAttribute('href');
        if (href) {
            Object.keys(navLinks).forEach(function(path) {
                if (href.includes(path)) {
                    const eventData = {
                        link_name: navLinks[path],
                        destination: href,
                        source_page: window.location.pathname
                    };
                    fbq('trackCustom', 'NavigationClick', eventData);
                    logMetaEvent('trackCustom', 'NavigationClick', eventData);
                }
            });
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
    // 3. SCROLL DEPTH TRACKING
    // ============================================
    const scrollMilestones = [25, 50, 75, 90, 100];
    const achievedScrollMilestones = new Set();

    function getScrollPercentage() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight === 0) return 100;
        return Math.round((scrollTop / scrollHeight) * 100);
    }

    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            const scrollPercent = getScrollPercentage();
            scrollMilestones.forEach(function(milestone) {
                if (scrollPercent >= milestone && !achievedScrollMilestones.has(milestone)) {
                    achievedScrollMilestones.add(milestone);
                    const eventData = {
                        depth_percent: milestone,
                        page: window.location.pathname
                    };
                    fbq('trackCustom', 'ScrollDepth', eventData);
                    logMetaEvent('trackCustom', 'ScrollDepth', eventData);
                }
            });
        }, 100);
    });

    // ============================================
    // 4. FORM SUBMISSION TRACKING (Registration Form)
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
