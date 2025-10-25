// Main JavaScript functionality for Zorn Website
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize profile system
    initializeProfileSystem();
    
    // Fade-in effect for all pages
    document.body.classList.add('loaded');
    
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                try {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } catch (error) {
                    console.warn('Invalid selector for anchor link:', href);
                }
            }
        });
    });

    // Form validation and submission (exclude forms that have their own handlers)
    const forms = document.querySelectorAll('form:not(#contactForm):not(#loginFormElement):not(#registerFormElement)');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'This field is required');
                } else {
                    field.classList.remove('error');
                    clearFieldError(field);
                }
            });

            // Email validation
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid email address');
                }
            });

            if (isValid) {
                // Show success message
                showNotification('Form submitted successfully!', 'success');
                
                // Reset form
                form.reset();
                
                // In a real application, you would submit the form data to a server
                console.log('Form would be submitted:', new FormData(form));
            } else {
                showNotification('Please correct the errors and try again.', 'error');
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .value-card, .team-member, .benefit-card');
    animateElements.forEach(el => observer.observe(el));

    // Back to top button
    createBackToTopButton();
    
    // Initialize theme toggle if available
    initializeThemeToggle();
    
    // Initialize search functionality if available
    initializeSearch();
});

// Utility Functions

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    // Type-specific colors
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.style.cursor = 'pointer';
    
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

function createBackToTopButton() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.title = 'Back to top';
    
    Object.assign(backToTop.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        opacity: '0',
        visibility: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: '1000',
        boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
    });
    
    document.body.appendChild(backToTop);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initializeThemeToggle() {
    // Theme toggle functionality can be added here
    // For now, we'll prepare for future implementation
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"], #memberSearch');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // This will be implemented in page-specific JS files
            if (typeof window.performSearch === 'function') {
                window.performSearch(searchTerm);
            }
        }, 300));
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading states
function showLoading(element) {
    if (element) {
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
    }
}

function hideLoading(element) {
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
}

// Scroll to features section function
function scrollToFeatures() {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        featuresSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Position info function for apply page
function showPositionInfo(position) {
    const positionInfo = {
        freestyler: {
            title: 'Freestyler',
            requirements: [
                'Must be 16+ years old',
                'Expert-level freestyle skills in Rocket League',
                'Creative and unique trick combinations',
                'Ability to create engaging freestyle content',
                'Strong game sense and mechanical skills',
                'Experience with video recording/streaming'
            ]
        },
        competitive: {
            title: 'Competitive Clip Hitter',
            requirements: [
                'Must be 16+ years old',
                'Champion rank or higher in competitive playlists',
                'Strong team communication and game sense',
                'Consistent performance under pressure',
                'Willingness to participate in scrims and tournaments',
                'Positive attitude and coachability'
            ]
        },
        editor: {
            title: 'Video Editor',
            requirements: [
                'Must be 16+ years old',
                'Proficiency in video editing software (Premiere, After Effects, etc.)',
                'Experience editing gaming/esports content',
                'Understanding of pacing and storytelling',
                'Knowledge of current trends in gaming videos',
                'Portfolio of previous work required'
            ]
        },
        designer: {
            title: 'Designer/Graphics',
            requirements: [
                'Must be 16+ years old',
                'Proficiency in design software (Photoshop, Illustrator, etc.)',
                'Experience with gaming/esports branding',
                'Strong understanding of visual hierarchy and typography',
                'Ability to work with team colors and branding guidelines',
                'Portfolio showcasing relevant design work'
            ]
        },
        creator: {
            title: 'Content Creator',
            requirements: [
                'Must be 16+ years old',
                'Existing YouTube/Twitch channel with regular uploads',
                'Engaging personality and strong communication skills',
                'Understanding of gaming content trends',
                'Consistent upload schedule and audience engagement',
                'Willingness to represent Team Zorn brand'
            ]
        },
        management: {
            title: 'Management',
            requirements: [
                'Must be 16+ years old',
                'Previous experience in team or project management',
                'Strong organizational and communication skills',
                'Understanding of esports industry and operations',
                'Ability to coordinate schedules and logistics',
                'Leadership experience preferred'
            ]
        },
        coach: {
            title: 'Coach/Analyst',
            requirements: [
                'Must be 16+ years old',
                'High-level Rocket League knowledge and game sense',
                'Experience coaching or mentoring players',
                'Ability to analyze gameplay and provide feedback',
                'Strong communication and teaching skills',
                'Understanding of competitive meta and strategies'
            ]
        },
        other: {
            title: 'Other Positions',
            requirements: [
                'Must be 16+ years old',
                'Clearly explain your proposed role and skills',
                'Demonstrate relevant experience or qualifications',
                'Show how you can contribute to Team Zorn',
                'Provide examples of previous work if applicable',
                'Professional attitude and reliability'
            ]
        }
    };

    const info = positionInfo[position];
    if (info) {
        const requirementsText = info.requirements.map(req => `• ${req}`).join('\n');
        alert(`${info.title} Requirements:\n\n${requirementsText}`);
    }
}

// Profile System Integration
function initializeProfileSystem() {
    // Wait for auth manager to be available
    setTimeout(() => {
        if (window.authManager) {
            window.authManager.updateUI();
        }
    }, 100);
}

// Profile-related utility functions
function updateUserProfileInHeader() {
    if (window.authManager) {
        window.authManager.updateHeaderUI();
    }
}

// Check if user is logged in
function isUserLoggedIn() {
    return window.authManager && window.authManager.currentUser;
}

// Get current user data
function getCurrentUser() {
    if (window.authManager) {
        return window.authManager.getUserData();
    }
    return null;
}

// Logout function for use throughout the site
function logoutUser() {
    if (window.AuthManager) {
        AuthManager.logout();
    }
}

// Scroll-triggered animations for about page
function initializeScrollAnimations() {
    // Check if we're on the about page
    if (!document.querySelector('.milestones-container')) {
        console.log('No milestones container found');
        return;
    }
    
    console.log('Initializing scroll animations for milestones');
    
    // Create intersection observer for milestone section
    const milestoneObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Milestone section intersecting, starting animations');
                
                // Add animation classes to timeline and items
                const container = entry.target;
                const items = container.querySelectorAll('.milestone-item');
                
                console.log('Found', items.length, 'milestone items');
                
                // Animate container first
                container.classList.add('animate-timeline');
                
                // Then animate items with staggered timing
                items.forEach((item, index) => {
                    setTimeout(() => {
                        console.log('Animating item', index);
                        item.classList.add('animate-in');
                        // Add number animation slightly after item animation
                        setTimeout(() => {
                            item.classList.add('animate-number');
                        }, 200);
                    }, index * 100); // Stagger by 100ms
                });
                
                // Stop observing after animation triggers
                milestoneObserver.unobserve(container);
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully visible
    });
    
    // Start observing the milestone container
    const container = document.querySelector('.milestones-container');
    if (container) {
        milestoneObserver.observe(container);
    }
}

// Export functions for use in other scripts
window.ZornUtils = {
    showNotification,
    showLoading,
    hideLoading,
    isValidEmail,
    debounce,
    updateUserProfileInHeader,
    isUserLoggedIn,
    getCurrentUser,
    logoutUser
};