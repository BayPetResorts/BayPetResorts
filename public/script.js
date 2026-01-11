// Page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const modal = document.getElementById('contactModal');
    const registerDogBtn = document.querySelector('.btn-register-dog');
    const closeBtn = document.querySelector('.modal-close');
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    // Open modal when Register Your Dog button is clicked
    if (registerDogBtn) {
        registerDogBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal when X is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            formMessage.textContent = '';
            formMessage.className = 'form-message';

            // Collect form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                dogName: document.getElementById('dogName').value.trim(),
                service: document.getElementById('service').value,
                message: document.getElementById('message').value.trim(),
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Success
                    formMessage.textContent = 'Thank you! We\'ll be in touch soon.';
                    formMessage.className = 'form-message success';
                    contactForm.reset();
                    
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        formMessage.textContent = '';
                    }, 2000);
                } else {
                    // Error
                    formMessage.textContent = data.error || 'Something went wrong. Please try again.';
                    formMessage.className = 'form-message error';
                }
            } catch (error) {
                formMessage.textContent = 'Network error. Please check your connection and try again.';
                formMessage.className = 'form-message error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

