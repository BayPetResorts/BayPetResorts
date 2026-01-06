// Zip code search functionality
document.addEventListener('DOMContentLoaded', function() {
    const zipCodeInput = document.getElementById('zipCodeInput');
    const searchBtn = document.getElementById('searchBtn');
    const findResortBtn = document.querySelector('.btn-find-resort');

    // Format zip code input (numbers only, max 5 digits)
    zipCodeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
        e.target.value = value;
    });

    // Search function
    async function performSearch() {
        const zipCode = zipCodeInput.value.trim();
        
        if (zipCode.length === 5) {
            try {
                // Show loading state
                searchBtn.disabled = true;
                searchBtn.textContent = 'SEARCHING...';
                
                // Make API call
                const response = await fetch(`/api/locations?zip=${zipCode}`);
                const data = await response.json();
                
                if (data.locations && data.locations.length > 0) {
                    // Display results (you can enhance this with a modal or results section)
                    const location = data.locations[0];
                    alert(`Found: ${location.name}\n${location.address}, ${location.city}, ${location.state} ${location.zip}\nDistance: ${location.distance}\nPhone: ${location.phone}`);
                } else {
                    alert(`No Bay Pet Ventures locations found near ${zipCode}. Please try another zip code.`);
                }
            } catch (error) {
                console.error('Error searching locations:', error);
                alert('Error searching for locations. Please try again.');
            } finally {
                // Reset button state
                searchBtn.disabled = false;
                searchBtn.textContent = 'SEARCH';
            }
        } else {
            alert('Please enter a valid 5-digit zip code');
            zipCodeInput.focus();
        }
    }

    // Search button click
    searchBtn.addEventListener('click', performSearch);

    // Enter key press in zip input
    zipCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Find Resort button click
    findResortBtn.addEventListener('click', function() {
        // Scroll to search box or trigger search
        zipCodeInput.focus();
        zipCodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

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

