/**
 * Contact Form Handler
 * Handles form submission with backend integration and Formspree fallback
 */

console.log('Contact.js loaded');

// Backend URL configuration
function getBackendUrl(endpoint) {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        return `http://localhost:3002${endpoint}`;
    } else {
        // Production backend URL - update this with your deployed backend URL
        return `https://zorn-backend-contact.onrender.com${endpoint}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing contact form');
    const form = document.getElementById('contactForm');
    const statusDiv = document.getElementById('form-status');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        setupFormValidation();
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        console.log('Contact form submission started');
        
        const form = e.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Show loading state
        showStatus('Sending your message...', 'loading');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Extract form data
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        try {
            // Try backend first
            const backendUrl = getBackendUrl('/api/contact');
            console.log('Attempting backend submission to:', backendUrl);
            
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('Form submitted successfully via backend');
                showStatus(result.message || 'Thank you! Your message has been sent successfully. We\'ll get back to you soon!', 'success');
                form.reset();
            } else {
                throw new Error(result.error || 'Backend submission failed');
            }
            
        } catch (backendError) {
            console.warn('Backend submission failed:', backendError);
            console.log('Falling back to Formspree...');
            
            // Fallback to Formspree
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', form.action);
                xhr.setRequestHeader('Accept', 'application/json');
                
                xhr.onload = function() {
                    console.log('Formspree request completed with status:', xhr.status);
                    if (xhr.status === 200 || xhr.status === 302) {
                        console.log('Form submitted successfully via Formspree');
                        showStatus('Thank you! Your message has been sent successfully. We\'ll get back to you soon!', 'success');
                        form.reset();
                    } else if (xhr.status === 404) {
                        console.error('Formspree endpoint not found');
                        showStatus('Please send your message directly to teamzornhq@gmail.com', 'error');
                    } else {
                        console.error('Formspree submission failed with status:', xhr.status);
                        showStatus('Sorry, there was an error sending your message. Please email us directly at teamzornhq@gmail.com', 'error');
                    }
                    
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                };
                
                xhr.onerror = function() {
                    console.error('Network error during Formspree submission');
                    showStatus('Network error. Please check your connection and try again.', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                };
                
                xhr.send(new FormData(form));
                
            } catch (formspreeError) {
                console.error('Formspree fallback error:', formspreeError);
                showStatus('Sorry, there was an error sending your message. Please email us directly at teamzornhq@gmail.com', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        }
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success/error messages after 8 seconds
        if (type !== 'loading') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 8000);
        }
    }
    
    function showStatus(message, type) {
        if (!statusDiv) return;
        
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success/error messages after 8 seconds
        if (type !== 'loading') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 8000);
        }
    }
    
    function setupFormValidation() {
        if (!form) return;
        
        const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
        requiredInputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
    }
    
    function validateInput(e) {
        const input = e.target;
        const formGroup = input.closest('.form-group');
        
        if (!input.value.trim()) {
            showInputError(formGroup, 'This field is required');
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            showInputError(formGroup, 'Please enter a valid email address');
        } else {
            clearInputError(formGroup);
        }
    }
    
    function clearValidationError(e) {
        const input = e.target;
        const formGroup = input.closest('.form-group');
        clearInputError(formGroup);
    }
    
    function clearValidationError(e) {
        const input = e.target;
        const formGroup = input.closest('.form-group');
        clearInputError(formGroup);
    }
    
    function showInputError(formGroup, message) {
        clearInputError(formGroup);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
        formGroup.classList.add('has-error');
    }
    
    function clearInputError(formGroup) {
        const existingError = formGroup.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
        formGroup.classList.remove('has-error');
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});