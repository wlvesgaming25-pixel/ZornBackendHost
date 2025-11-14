/**
 * Enhanced Application Form Validation & UX
 * Provides client-side validation, real-time feedback, and improved user experience
 */

class ApplicationFormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.errors = {};
        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupValidation();
        this.setupProgressIndicator();
        this.setupRealTimeFeedback();
        this.setupFormSubmission();
    }

    /**
     * Setup form validation rules
     */
    setupValidation() {
        this.validationRules = {
            fullName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s'-]+$/,
                message: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            discordTag: {
                required: true,
                pattern: /^[a-z0-9._]{2,32}$/,
                message: 'Discord username must be 2-32 characters (lowercase letters, numbers, periods, and underscores only)'
            },
            rlRank: {
                required: true,
                message: 'Please select your current rank'
            },
            platform: {
                required: true,
                message: 'Please select your gaming platform'
            },
            age: {
                required: true,
                min: 13,
                max: 99,
                message: 'Age must be between 13 and 99'
            },
            country: {
                required: true,
                message: 'Please enter your country'
            }
        };
    }

    /**
     * Setup real-time field validation
     */
    setupRealTimeFeedback() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Clear error on focus
            field.addEventListener('focus', () => {
                this.clearFieldError(field);
            });

            // Real-time validation for text inputs
            if (field.type === 'text' || field.type === 'email') {
                field.addEventListener('input', () => {
                    // Debounce validation
                    clearTimeout(field.validationTimeout);
                    field.validationTimeout = setTimeout(() => {
                        this.validateField(field, true);
                    }, 500);
                });
            }
        });
    }

    /**
     * Validate a single field
     */
    validateField(field, silent = false) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];

        if (!rules) return true;

        // Clear previous error
        delete this.errors[fieldName];

        // Required check
        if (rules.required && !value) {
            this.errors[fieldName] = 'This field is required';
            if (!silent) this.showFieldError(field, this.errors[fieldName]);
            return false;
        }

        // Skip other validations if empty and not required
        if (!value) {
            if (!silent) this.clearFieldError(field);
            return true;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            this.errors[fieldName] = rules.message || 'Invalid format';
            if (!silent) this.showFieldError(field, this.errors[fieldName]);
            return false;
        }

        // Min length validation
        if (rules.minLength && value.length < rules.minLength) {
            this.errors[fieldName] = `Must be at least ${rules.minLength} characters`;
            if (!silent) this.showFieldError(field, this.errors[fieldName]);
            return false;
        }

        // Min value validation (for numbers)
        if (rules.min !== undefined && parseFloat(value) < rules.min) {
            this.errors[fieldName] = rules.message || `Must be at least ${rules.min}`;
            if (!silent) this.showFieldError(field, this.errors[fieldName]);
            return false;
        }

        // Max value validation (for numbers)
        if (rules.max !== undefined && parseFloat(value) > rules.max) {
            this.errors[fieldName] = rules.message || `Must be at most ${rules.max}`;
            if (!silent) this.showFieldError(field, this.errors[fieldName]);
            return false;
        }

        // Field is valid
        if (!silent) {
            this.clearFieldError(field);
            this.showFieldSuccess(field);
        }
        return true;
    }

    /**
     * Show error for a field
     */
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove success state
        formGroup.classList.remove('success');
        
        // Add error state
        formGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideDown 0.3s ease-out;
        `;
        formGroup.appendChild(errorDiv);
    }

    /**
     * Clear error for a field
     */
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error', 'success');
        
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }

    /**
     * Show success state for a field
     */
    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('success');
    }

    /**
     * Validate entire form
     */
    validateForm() {
        this.errors = {};
        let isValid = true;
        
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Setup form submission
     */
    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate form
            if (!this.validateForm()) {
                this.showNotification('Please fix the errors in the form', 'error');
                
                // Scroll to first error
                const firstError = this.form.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Show loading state
            this.showLoadingState();

            try {
                // Get form data
                const formData = new FormData(this.form);
                const data = Object.fromEntries(formData);

                // Submit to backend
                const response = await this.submitApplication(data);

                if (response.success) {
                    this.showSuccessState();
                } else {
                    throw new Error(response.message || 'Submission failed');
                }
            } catch (error) {
                console.error('Submission error:', error);
                this.showErrorState(error.message);
            }
        });
    }

    /**
     * Submit application to backend
     */
    async submitApplication(data) {
        // For now, save to localStorage (replace with actual API call)
        try {
            // Get existing applications
            const applications = JSON.parse(localStorage.getItem('zornApplications') || '[]');
            
            // Add new application
            const application = {
                id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...data,
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };
            
            applications.push(application);
            localStorage.setItem('zornApplications', JSON.stringify(applications));

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
                </svg>
                Submitting...
            `;
        }
    }

    /**
     * Show success state
     */
    showSuccessState() {
        // Hide form
        this.form.style.display = 'none';

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-state';
        successDiv.innerHTML = `
            <div class="success-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9 12l2 2 4-4"></path>
                </svg>
            </div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for applying to Team Zorn. We'll review your application and get back to you within 3-7 business days.</p>
            <p>You'll receive a confirmation email at <strong>${this.form.querySelector('#email')?.value}</strong></p>
            <div class="success-actions">
                <a href="index.html" class="btn btn-primary">Return to Home</a>
                <a href="apply.html" class="btn btn-secondary">Apply for Another Position</a>
            </div>
        `;
        successDiv.style.cssText = `
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(74, 222, 128, 0.1);
            border: 2px solid rgba(74, 222, 128, 0.3);
            border-radius: 16px;
            animation: fadeIn 0.5s ease-out;
        `;

        this.form.parentElement.insertBefore(successDiv, this.form);
        
        this.showNotification('Application submitted successfully!', 'success');
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Application';
        }

        this.showNotification(message || 'Failed to submit application. Please try again.', 'error');
    }

    /**
     * Setup progress indicator
     */
    setupProgressIndicator() {
        // Calculate form completion
        const updateProgress = () => {
            const fields = Array.from(this.form.querySelectorAll('input, select, textarea'));
            const requiredFields = fields.filter(f => f.hasAttribute('required'));
            const filledFields = requiredFields.filter(f => f.value.trim() !== '');
            
            const progress = (filledFields.length / requiredFields.length) * 100;
            
            // Update progress bar if exists
            const progressBar = document.querySelector('.form-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            // Update progress text
            const progressText = document.querySelector('.form-progress-text');
            if (progressText) {
                progressText.textContent = `${filledFields.length} of ${requiredFields.length} required fields completed`;
            }
        };

        // Listen to all field changes
        this.form.addEventListener('input', updateProgress);
        this.form.addEventListener('change', updateProgress);
        
        // Initial update
        updateProgress();
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize form validator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.apply-form');
    if (form) {
        window.formValidator = new ApplicationFormValidator(form);
        
        // Add progress indicator to form
        const formSection = document.getElementById('applicationFormSection');
        if (formSection && !document.querySelector('.form-progress')) {
            const progressHTML = `
                <div class="form-progress" style="margin-bottom: 2rem;">
                    <div class="form-progress-text" style="text-align: center; margin-bottom: 0.5rem; color: #aaa; font-size: 0.875rem;">
                        0 of 0 required fields completed
                    </div>
                    <div style="background: rgba(99, 102, 241, 0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div class="form-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
            
            const h2 = formSection.querySelector('h2');
            if (h2) {
                h2.insertAdjacentHTML('afterend', progressHTML);
            }
        }
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }

    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }

    .form-group.success input,
    .form-group.success select,
    .form-group.success textarea {
        border-color: #4ade80 !important;
    }

    .form-group.success::after {
        content: '✓';
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #4ade80;
        font-weight: bold;
        font-size: 1.25rem;
    }

    .spinner {
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 0.5rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .success-state {
        animation: fadeIn 0.5s ease-out;
    }

    .success-icon {
        margin-bottom: 1.5rem;
        animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }
`;
document.head.appendChild(style);
