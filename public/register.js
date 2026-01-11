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
    
    // Validation Functions
    function validatePhone(phone) {
        return PHONE_REGEX.test(phone) && phone.length >= MIN_PHONE_LENGTH;
    }
    
    function validateEmail(email) {
        return EMAIL_REGEX.test(email);
    }
    
    function validateStep(step) {
        const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepEl) return false;
        
        let isValid = true;
        const requiredInputs = stepEl.querySelectorAll('input[required]');
        
        requiredInputs.forEach(input => {
            const value = input.value.trim();
            
            if (!value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
                
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
    
    function collectFormData() {
        const notesEl = getElement('notes');
        return {
            phone: getFieldValue('phone'),
            firstName: getFieldValue('firstName'),
            lastName: getFieldValue('lastName'),
            email: getFieldValue('email'),
            dogName: getFieldValue('dogName'),
            breed: getFieldValue('breed'),
            notes: notesEl ? notesEl.value.trim() : '',
            timestamp: new Date().toISOString()
        };
    }
    
    function validateFormData(formData) {
        const errors = [];
        
        if (!formData.phone) {
            errors.push({ field: 'phone', step: 1, message: 'Phone number is required' });
        } else if (!validatePhone(formData.phone)) {
            errors.push({ field: 'phone', step: 1, message: 'Please enter a valid phone number' });
        }
        
        if (!formData.firstName) errors.push({ field: 'firstName', step: 2, message: 'First name is required' });
        if (!formData.lastName) errors.push({ field: 'lastName', step: 2, message: 'Last name is required' });
        
        if (!formData.email) {
            errors.push({ field: 'email', step: 2, message: 'Email address is required' });
        } else if (!validateEmail(formData.email)) {
            errors.push({ field: 'email', step: 2, message: 'Please enter a valid email address' });
        }
        
        if (!formData.dogName) errors.push({ field: 'dogName', step: 3, message: 'Dog name is required' });
        if (!formData.breed) errors.push({ field: 'breed', step: 3, message: 'Breed is required' });
        
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
        
        const formData = collectFormData();
        const validationErrors = validateFormData(formData);
        
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
    
    initializeFormFields();
});

