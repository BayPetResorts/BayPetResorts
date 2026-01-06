// Page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Register Your Dog button click
    const registerDogBtn = document.querySelector('.btn-register-dog');
    if (registerDogBtn) {
        registerDogBtn.addEventListener('click', function() {
            // You can add registration functionality here
            alert('Registration form coming soon!');
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

