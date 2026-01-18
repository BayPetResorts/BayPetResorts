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
                fbq('trackCustom', 'TimeOnSite', {
                    seconds: milestone,
                    milestone: milestone + 's',
                    page: window.location.pathname
                });
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
        }
    });

    // ============================================
    // 2. BUTTON CLICK TRACKING
    // ============================================
    function trackButtonClick(buttonName, buttonType, destination) {
        fbq('trackCustom', 'ButtonClick', {
            button_name: buttonName,
            button_type: buttonType,
            destination: destination || 'none',
            page: window.location.pathname
        });
    }

    // Track hero buttons (Boarding & Daycare)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        // Hero Boarding Button
        if (target.classList.contains('btn-boarding') || target.closest('.btn-boarding')) {
            trackButtonClick('Boarding', 'hero_cta', '/register');
            fbq('track', 'ViewContent', {
                content_name: 'Boarding Service',
                content_category: 'Services',
                content_type: 'service'
            });
        }

        // Hero Daycare Button
        if (target.classList.contains('btn-daycare') || target.closest('.btn-daycare')) {
            trackButtonClick('Daycare', 'hero_cta', '/register');
            fbq('track', 'ViewContent', {
                content_name: 'Daycare Service',
                content_category: 'Services',
                content_type: 'service'
            });
        }

        // Contact buttons
        if (target.classList.contains('contact-btn-phone') || target.closest('.contact-btn-phone')) {
            trackButtonClick('Call Us', 'contact', 'tel');
            fbq('track', 'Contact', {
                contact_type: 'phone'
            });
        }

        if (target.classList.contains('contact-btn-email') || target.closest('.contact-btn-email')) {
            trackButtonClick('Email Us', 'contact', 'mailto');
            fbq('track', 'Contact', {
                contact_type: 'email'
            });
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
                    fbq('trackCustom', 'NavigationClick', {
                        link_name: navLinks[path],
                        destination: href,
                        source_page: window.location.pathname
                    });
                }
            });
        }

        // Footer links
        if (target.closest('.footer-links') || target.closest('.main-footer')) {
            const linkText = target.textContent.trim();
            if (linkText) {
                fbq('trackCustom', 'FooterClick', {
                    link_name: linkText,
                    destination: href || 'none'
                });
            }
        }

        // Social media links
        if (href && (href.includes('facebook.com') || href.includes('instagram.com'))) {
            fbq('trackCustom', 'SocialClick', {
                platform: href.includes('facebook') ? 'Facebook' : 'Instagram',
                source_page: window.location.pathname
            });
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
                    fbq('trackCustom', 'ScrollDepth', {
                        depth_percent: milestone,
                        page: window.location.pathname
                    });
                }
            });
        }, 100);
    });

    // ============================================
    // 4. FORM INTERACTION TRACKING (Registration Form)
    // ============================================
    // Listen for messages from the registration form iframe
    window.addEventListener('message', function(event) {
        // Only process messages from our domain
        if (event.origin !== window.location.origin && !event.origin.includes('baypetresorts.com')) {
            return;
        }

        const data = event.data;
        if (!data || !data.type) return;

        switch (data.type) {
            case 'formStepStarted':
                fbq('trackCustom', 'FormStepStarted', {
                    step: data.step,
                    step_name: data.stepName || 'Step ' + data.step
                });
                break;

            case 'formStepCompleted':
                fbq('trackCustom', 'FormStepCompleted', {
                    step: data.step,
                    step_name: data.stepName || 'Step ' + data.step
                });
                break;

            case 'formFieldFocused':
                fbq('trackCustom', 'FormFieldInteraction', {
                    field: data.field,
                    action: 'focus',
                    step: data.step
                });
                break;

            case 'formSubmitted':
                fbq('track', 'Lead', {
                    content_name: 'Dog Registration Complete',
                    content_category: 'Registration',
                    services: data.services || []
                });
                fbq('track', 'CompleteRegistration', {
                    content_name: 'Dog Registration',
                    status: 'completed'
                });
                break;

            case 'formAbandoned':
                fbq('trackCustom', 'FormAbandoned', {
                    last_step: data.lastStep,
                    last_step_name: data.lastStepName,
                    fields_filled: data.fieldsFilled || 0,
                    time_spent: data.timeSpent || 0
                });
                break;
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
            fbq('track', 'ViewContent', {
                content_name: info.name,
                content_category: info.category,
                content_type: 'page'
            });
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
                    fbq('trackCustom', 'TestimonialsViewed', {
                        page: window.location.pathname
                    });
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
            fbq('trackCustom', 'PromoBannerClosed', {
                page: window.location.pathname
            });
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
            fbq('track', 'Contact', {
                contact_type: 'phone_call',
                phone_number: href.replace('tel:', '')
            });
        }

        // Track emails
        if (href.startsWith('mailto:')) {
            fbq('track', 'Contact', {
                contact_type: 'email',
                email: href.replace('mailto:', '')
            });
        }

        // Track external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            fbq('trackCustom', 'OutboundLink', {
                destination: href,
                source_page: window.location.pathname
            });
        }
    });

    console.log('Meta Pixel Advanced Tracking initialized');
})();
