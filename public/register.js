// Bay Pet Resorts - Registration Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const TOTAL_STEPS = 3;
    const PHONE_REGEX = /^[\d\s\(\)\-]+$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MIN_PHONE_LENGTH = 10;
    
    // DOM Elements
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const successScreen = document.getElementById('successScreen');
    const progressTrack = document.querySelector('.progress-track');
    
    // State
    let currentStep = 1;
    
    // Breed list
    const BREED_LIST = [
        'Mixed Breed (Mutt)',
        'Affenpinscher', 'Afghan Hound', 'Akita', 'Alaskan Malamute',
        'American English Coonhound', 'American Eskimo Dog', 'American Hairless Terrier',
        'American Staffordshire Terrier', 'American Water Spaniel', 'Anatolian Shepherd Dog',
        'Australian Cattle Dog', 'Australian Shepherd', 'Australian Terrier', 'Azawakh',
        'Barbet', 'Basset Hound', 'Beagle', 'Bearded Collie', 'Beauceron', 'Bedlington Terrier',
        'Belgian Laekenois', 'Belgian Malinois', 'Belgian Sheepdog', 'Belgian Tervuren',
        'Bergamasco Sheepdog', 'Bernedoodle', 'Bernese Mountain Dog', 'Bichon Frise',
        'Biewer Terrier', 'Black and Tan Coonhound', 'Black Russian Terrier', 'Bloodhound',
        'Bluetick Coonhound', 'Boerboel', 'Border Collie', 'Border Terrier', 'Borzoi',
        'Boston Terrier', 'Bouvier des Flandres', 'Boxer', 'Boykin Spaniel', 'Bracco Italiano',
        'Briard', 'Brittany', 'Brussels Griffon', 'Bulldog', 'Bullmastiff', 'Bull Terrier',
        'Cairn Terrier', 'Cane Corso', 'Canaan Dog', 'Cardigan Welsh Corgi',
        'Cavalier King Charles Spaniel', 'Cesky Terrier', 'Chesapeake Bay Retriever',
        'Chihuahua', 'Chinese Crested', 'Chinese Shar-Pei', 'Chinook', 'Chow Chow',
        'Cirneco dell\'Etna', 'Clumber Spaniel', 'Cockapoo', 'Cocker Spaniel', 'Coton de Tulear',
        'Dachshund', 'Dalmation', 'Dandie Dinmont Terrier', 'Doberman Pinscher',
        'Dogues de Bordeaux', 'English Cocker Spaniel', 'English Foxhound',
        'English Springer Spaniel', 'English Toy Spaniel', 'Entlebucher Mountain Dog',
        'Estrela Mountain Dog', 'Field Spaniel', 'Finnish Lapphund', 'Finnish Spitz',
        'Flat-Coated Retriever', 'Fox Terrier (Smooth)', 'Fox Terrier (Wire)', 'French Bulldog',
        'German Pinscher', 'German Shepherd Dog', 'German Shorthaired Pointer', 'Giant Schnauzer',
        'Glen of Imaal Terrier', 'Golden Retriever', 'Goldendoodle', 'Gordon Setter',
        'Grand Basset Griffon Vendéen', 'Great Dane', 'Great Pyrenees', 'Greater Swiss Mountain Dog',
        'Greyhound', 'Harrier', 'Havanese', 'Hokkaido', 'Ibizan Hound', 'Iceland Sheepdog',
        'Irish Red and White Setter', 'Irish Setter', 'Irish Terrier', 'Irish Wolfhound',
        'Italian Greyhound', 'Japanese Chin', 'Keeshond', 'Kerry Blue Terrier', 'Komondor', 'Kuvasz',
        'Labradoodle', 'Labrador Retriever', 'Lagotto Romagnolo', 'Lakeland Terrier',
        'Lancashire Heeler', 'Leonberger', 'Lhasa Apso', 'Lowchen', 'Maltipoo', 'Manchester Terrier',
        'Mastiff', 'Miniature American Shepherd', 'Miniature Pinscher', 'Miniature Schnauzer', 'Mudi',
        'Neapolitan Mastiff', 'Nederlandse Kooikerhondje', 'Newfoundland', 'Norfolk Terrier',
        'Norwegian Buhund', 'Norwegian Elkhound', 'Norwegian Lundehund',
        'Nova Scotia Duck Tolling Retriever', 'Old English Sheepdog', 'Otterhound',
        'Papillon', 'Parson Russell Terrier', 'Pekingese', 'Pembroke Welsh Corgi',
        'Peruvian Inca Orchid', 'Petit Basset Griffon Vendéen', 'Pharaoh Hound', 'Plott Hound',
        'Pointer', 'Polish Lowland Sheepdog', 'Pomeranian', 'Poodle', 'Portuguese Water Dog',
        'Pug', 'Puli', 'Pumi', 'Pyrenean Shepherd', 'Rat Terrier', 'Redbone Coonhound',
        'Rhodesian Ridgeback', 'Rottweiler', 'Russell Terrier', 'Russian Toy', 'Saluki', 'Samoyed',
        'Schipperke', 'Scottish Deerhound', 'Scottish Terrier', 'Sealyham Terrier',
        'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 'Silky Terrier',
        'Skye Terrier', 'Sloughi', 'Soft Coated Wheaten Terrier', 'Spanish Water Dog',
        'Spinone Italiano', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 'St. Bernard',
        'Sussex Spaniel', 'Swedish Vallhund', 'Tibetan Mastiff', 'Tibetan Spaniel',
        'Tibetan Terrier', 'Toy Fox Terrier', 'Treeing Walker Coonhound', 'Vizsla', 'Weimaraner',
        'Welsh Springer Spaniel', 'Welsh Terrier', 'West Highland White Terrier', 'Whippet',
        'Wirehaired Pointing Griffon', 'Wirehaired Vizsla', 'Xoloitzcuintli', 'Yorkshire Terrier',
        'Other'
    ];
    
    // Utility Functions
    function getElement(id) {
        return document.getElementById(id);
    }
    
    function getFieldValue(id) {
        const el = getElement(id);
        return el ? el.value.trim() : '';
    }
    
    function showError(message, element = null) {
        if (element) element.classList.add('error');
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = 'form-message error';
        }
    }
    
    function clearErrors() {
        document.querySelectorAll('.form-step input').forEach(input => {
            input.classList.remove('error');
        });
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }
    }
    
    function resetSubmitButton(btn, originalText) {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
    
    function resetForm() {
        if (contactForm) {
            contactForm.reset();
            currentStep = 1;
            clearErrors();
            showStep(1);
            hideSuccessScreen();
        }
    }
    
    function showSuccessScreen() {
        if (contactForm) contactForm.style.display = 'none';
        if (progressTrack) progressTrack.style.display = 'none';
        if (successScreen) successScreen.style.display = 'flex';
    }
    
    function hideSuccessScreen() {
        if (successScreen) successScreen.style.display = 'none';
        if (contactForm) contactForm.style.display = 'block';
        if (progressTrack) progressTrack.style.display = 'flex';
    }
    
    // Step Navigation
    function showStep(step) {
        const validStep = Math.max(1, Math.min(parseInt(step) || 1, TOTAL_STEPS));
        
        document.querySelectorAll('.form-step').forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            const isActive = stepNum === validStep;
            stepEl.classList.toggle('active', isActive);
            
            stepEl.querySelectorAll('input').forEach(input => {
                if (isActive && input.hasAttribute('data-originally-required')) {
                    input.required = true;
                } else if (!isActive && input.required) {
                    input.removeAttribute('required');
                }
            });
        });
        
        document.querySelectorAll('.milestone').forEach(milestone => {
            const milestoneStep = parseInt(milestone.dataset.step);
            milestone.classList.toggle('active', milestoneStep <= validStep);
        });
        
        const dogWalker = document.getElementById('dogWalker');
        if (dogWalker && progressTrack) {
            dogWalker.className = 'dog-walker step-' + validStep;
            progressTrack.className = 'progress-track step-' + validStep;
        }
        
        currentStep = validStep;
    }
    
    function initializeFormFields() {
        document.querySelectorAll('.form-step input[required]').forEach(input => {
            input.setAttribute('data-originally-required', 'true');
        });
        showStep(1);
    }
    
    // Phone Number Formatting
    function formatPhoneNumber(value) {
        // Remove all non-digit characters
        const phoneNumber = value.replace(/\D/g, '');
        
        // Limit to 10 digits
        const phoneNumberDigits = phoneNumber.slice(0, 10);
        
        // Format based on length
        if (phoneNumberDigits.length === 0) {
            return '';
        } else if (phoneNumberDigits.length <= 3) {
            return `(${phoneNumberDigits}`;
        } else if (phoneNumberDigits.length <= 6) {
            return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
        } else {
            return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6)}`;
        }
    }
    
    // Validation Functions
    function validatePhone(phone) {
        // Remove formatting to check digit count
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= MIN_PHONE_LENGTH;
    }
    
    function validateEmail(email) {
        return EMAIL_REGEX.test(email);
    }
    
    function collectFormData() {
        const notesEl = getElement('notes');
        
        // Return plain object (files are optional and not stored for now)
        return {
            phone: getFieldValue('phone'),
            firstName: getFieldValue('firstName'),
            lastName: getFieldValue('lastName'),
            email: getFieldValue('email'),
            dogName: getFieldValue('dogName'),
            breed: getFieldValue('breed'),
            notes: notesEl ? notesEl.value.trim() : ''
        };
    }
    
    function validateFormData() {
        const errors = [];
        const phone = getFieldValue('phone');
        const firstName = getFieldValue('firstName');
        const lastName = getFieldValue('lastName');
        const email = getFieldValue('email');
        const dogName = getFieldValue('dogName');
        const breed = getFieldValue('breed');
        
        if (!phone) {
            errors.push({ field: 'phone', step: 1, message: 'Phone number is required' });
        } else if (!validatePhone(phone)) {
            errors.push({ field: 'phone', step: 1, message: 'Please enter a valid phone number' });
        }
        
        if (!firstName) errors.push({ field: 'firstName', step: 2, message: 'First name is required' });
        if (!lastName) errors.push({ field: 'lastName', step: 2, message: 'Last name is required' });
        
        if (!email) {
            errors.push({ field: 'email', step: 2, message: 'Email address is required' });
        } else if (!validateEmail(email)) {
            errors.push({ field: 'email', step: 2, message: 'Please enter a valid email address' });
        }
        
        if (!dogName) errors.push({ field: 'dogName', step: 3, message: 'Dog name is required' });
        if (!breed) errors.push({ field: 'breed', step: 3, message: 'Breed is required' });
        
        // Vaccination files are optional - no validation needed
        
        return errors;
    }
    
    // Form Submission
    async function submitForm() {
        if (!contactForm) return;
        
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn?.textContent || 'Submit';
        
        clearErrors();
        
        if (!validateStep(currentStep)) {
            showError('Please complete the current step.');
            resetSubmitButton(submitBtn, originalBtnText);
            return;
        }
        
        const validationErrors = validateFormData();
        
        if (validationErrors.length > 0) {
            const firstError = validationErrors[0];
            showStep(firstError.step);
            
            validationErrors.forEach(err => {
                const errorField = getElement(err.field);
                if (errorField) errorField.classList.add('error');
            });
            
            showError(firstError.message);
            resetSubmitButton(submitBtn, originalBtnText);
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        try {
            const formData = collectFormData();
            
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccessScreen();
            } else {
                showError(data.error || 'Something went wrong. Please try again.');
                resetSubmitButton(submitBtn, originalBtnText);
            }
        } catch (error) {
            showError('Network error. Please check your connection and try again.');
            resetSubmitButton(submitBtn, originalBtnText);
        }
    }
    
    // Event Listeners
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateStep(currentStep) && currentStep < TOTAL_STEPS) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });
    
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentStep === TOTAL_STEPS) {
                submitForm();
            }
        });
    }
    
    // Phone number auto-formatting
    const phoneInput = getElement('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const cursorPosition = e.target.selectionStart;
            const oldValue = e.target.value;
            const formatted = formatPhoneNumber(e.target.value);
            
            e.target.value = formatted;
            
            // Adjust cursor position after formatting
            const newCursorPosition = formatted.length - (oldValue.length - cursorPosition);
            e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        });
        
        // Prevent non-digit characters (except for formatting)
        phoneInput.addEventListener('keydown', (e) => {
            // Allow: backspace, delete, tab, escape, enter, and arrow keys
            if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    
    // Breed Searchable Dropdown
    function initializeBreedDropdown() {
        const breedSearch = getElement('breedSearch');
        const breedHidden = getElement('breed');
        const breedDropdownList = getElement('breedDropdownList');
        
        if (!breedSearch || !breedHidden || !breedDropdownList) return;
        
        let isOpen = false;
        
        function filterBreeds(searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return BREED_LIST;
            return BREED_LIST.filter(breed => breed.toLowerCase().includes(term));
        }
        
        function renderDropdown(filteredBreeds) {
            breedDropdownList.innerHTML = '';
            
            if (filteredBreeds.length === 0) {
                breedDropdownList.innerHTML = '<div class="breed-dropdown-item no-results">No breeds found</div>';
                return;
            }
            
            filteredBreeds.forEach(breed => {
                const item = document.createElement('div');
                item.className = 'breed-dropdown-item';
                item.textContent = breed;
                item.addEventListener('click', () => {
                    breedSearch.value = breed;
                    breedHidden.value = breed;
                    breedSearch.classList.remove('error');
                    closeDropdown();
                });
                breedDropdownList.appendChild(item);
            });
        }
        
        function openDropdown() {
            isOpen = true;
            breedDropdownList.style.display = 'block';
            const filtered = filterBreeds(breedSearch.value);
            renderDropdown(filtered);
        }
        
        function closeDropdown() {
            isOpen = false;
            breedDropdownList.style.display = 'none';
        }
        
        breedSearch.addEventListener('focus', openDropdown);
        breedSearch.addEventListener('input', (e) => {
            const filtered = filterBreeds(e.target.value);
            renderDropdown(filtered);
            if (!isOpen) openDropdown();
        });
        
        breedSearch.addEventListener('blur', (e) => {
            // Delay to allow click events to fire
            setTimeout(() => {
                closeDropdown();
                // If search value doesn't match any breed and isn't empty, clear it
                if (breedSearch.value && !BREED_LIST.includes(breedSearch.value)) {
                    breedSearch.value = '';
                    breedHidden.value = '';
                }
            }, 200);
        });
        
        // Handle keyboard navigation
        breedSearch.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
                const items = breedDropdownList.querySelectorAll('.breed-dropdown-item:not(.no-results)');
                if (items.length === 0) return;
                
                if (e.key === 'Escape') {
                    closeDropdown();
                    breedSearch.blur();
                    return;
                }
                
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (items[0]) {
                        items[0].click();
                    }
                    return;
                }
                
                e.preventDefault();
                const currentIndex = Array.from(items).findIndex(item => item.classList.contains('highlighted'));
                let nextIndex = 0;
                
                if (e.key === 'ArrowDown') {
                    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                } else if (e.key === 'ArrowUp') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                }
                
                items.forEach(item => item.classList.remove('highlighted'));
                items[nextIndex].classList.add('highlighted');
                items[nextIndex].scrollIntoView({ block: 'nearest' });
            }
        });
    }
    
    // Update validation to check breed
    function validateStep(step) {
        const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepEl) return false;
        
        let isValid = true;
        const requiredInputs = stepEl.querySelectorAll('input[required]');
        
        requiredInputs.forEach(input => {
            // Handle checkboxes separately
            if (input.type === 'checkbox') {
                if (!input.checked) {
                    isValid = false;
                    input.classList.add('error');
                    const label = input.closest('.sms-checkbox-label');
                    if (label) label.classList.add('error');
                } else {
                    input.classList.remove('error');
                    const label = input.closest('.sms-checkbox-label');
                    if (label) label.classList.remove('error');
                }
                return;
            }
            
            // Handle file inputs separately
            if (input.type === 'file') {
                if (!input.files || input.files.length === 0) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
                return;
            }
            
            const value = input.value.trim();
            
            if (!value) {
                isValid = false;
                input.classList.add('error');
                // Also highlight the search input if breed is missing
                if (input.id === 'breed') {
                    const breedSearch = getElement('breedSearch');
                    if (breedSearch) breedSearch.classList.add('error');
                }
            } else {
                input.classList.remove('error');
                if (input.id === 'breed') {
                    const breedSearch = getElement('breedSearch');
                    if (breedSearch) breedSearch.classList.remove('error');
                }
                
                if (step === 1 && input.id === 'phone' && !validatePhone(value)) {
                    isValid = false;
                    input.classList.add('error');
                } else if (step === 2 && input.id === 'email' && !validateEmail(value)) {
                    isValid = false;
                    input.classList.add('error');
                }
            }
        });
        
        return isValid;
    }
    
    // Initialize vaccination card click handlers
    function initializeVaccinationCards() {
        const vaccinationItems = document.querySelectorAll('.vaccination-item');
        
        vaccinationItems.forEach(item => {
            const vaccinationType = item.dataset.vaccination;
            const fileInput = item.querySelector('input[type="file"]');
            const fileNameSpan = item.querySelector('.vaccination-file-name');
            
            if (!fileInput) return;
            
            // Click on card to trigger file input
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on the file name (for potential future remove functionality)
                if (e.target.classList.contains('vaccination-file-name')) {
                    return;
                }
                fileInput.click();
            });
            
            // Handle file selection
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    item.classList.add('has-file');
                    fileNameSpan.textContent = file.name;
                } else {
                    item.classList.remove('has-file');
                    fileNameSpan.textContent = '';
                }
            });
        });
    }
    
    initializeFormFields();
    initializeBreedDropdown();
    initializeVaccinationCards();
});

