/**
 * Team Zorn Access Restricted Page JavaScript
 * Handles user info display, animations, and redirect functionality
 */

class AccessRestrictedPage {
    constructor() {
        this.redirectTimer = null;
        this.redirectCountdown = 10;
        this.isRedirecting = false;
        this.config = new ProductionConfig();
        
        this.init();
    }

    /**
     * Initialize the page functionality
     */
    init() {
        this.createParticles();
        this.displayUserInfo();
        this.setupEventListeners();
        this.startAnimations();
        
        // Optional auto-redirect (uncomment if desired)
        // this.startRedirectTimer();
    }

    /**
     * Create floating particles animation
     */
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Create initial particles
        for (let i = 0; i < 15; i++) {
            this.createParticle();
        }

        // Create new particles periodically
        setInterval(() => {
            this.createParticle();
        }, 800);
    }

    /**
     * Create a single floating particle
     */
    createParticle() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation duration
        const duration = Math.random() * 4 + 6;
        particle.style.animationDuration = duration + 's';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 2) * 1000);
    }

    /**
     * Display user information if available
     */
    displayUserInfo() {
        // Get user email from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const userEmail = urlParams.get('email');
        
        if (userEmail) {
            this.showUserInfo(userEmail);
        } else {
            // Try to get user from other sources
            this.getCurrentUser().then(user => {
                if (user && user.email) {
                    this.showUserInfo(user.email);
                }
            });
        }
    }

    /**
     * Show user information panel
     */
    showUserInfo(email) {
        const userInfo = document.getElementById('userInfo');
        const userEmailElement = document.getElementById('userEmail');
        
        if (userInfo && userEmailElement) {
            userEmailElement.textContent = email;
            userInfo.style.display = 'block';
            
            // Animate in
            setTimeout(() => {
                userInfo.style.opacity = '0';
                userInfo.style.transform = 'translateY(20px)';
                userInfo.style.transition = 'all 0.5s ease';
                
                requestAnimationFrame(() => {
                    userInfo.style.opacity = '1';
                    userInfo.style.transform = 'translateY(0)';
                });
            }, 500);
        }
    }

    /**
     * Get current user from various sources
     */
    async getCurrentUser() {
        try {
            // Check auth manager
            if (typeof window.authManager !== 'undefined') {
                return window.authManager.getCurrentUser();
            }

            // Check localStorage
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }

            // Check JWT token
            const token = this.getJWTToken();
            if (token) {
                return await this.validateJWTToken(token);
            }

            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get JWT token from cookies
     */
    getJWTToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'authToken') {
                return value;
            }
        }
        return null;
    }

    /**
     * Validate JWT token with backend
     */
    async validateJWTToken(token) {
        try {
            const response = await fetch(`${this.config.getOAuthUrl()}/api/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                return userData.user;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
        }
        return null;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Cancel redirect button
        const cancelRedirect = document.getElementById('cancelRedirect');
        if (cancelRedirect) {
            cancelRedirect.addEventListener('click', () => {
                this.cancelRedirect();
            });
        }

        // Add hover effects to action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('mouseenter', this.handleButtonHover);
            button.addEventListener('mouseleave', this.handleButtonLeave);
        });

        // Add click tracking
        document.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn')) {
                console.log('Access restricted - button clicked:', e.target.textContent.trim());
            }
        });
    }

    /**
     * Handle button hover effect
     */
    handleButtonHover(e) {
        const button = e.target;
        button.style.transform = 'translateY(-2px) scale(1.02)';
    }

    /**
     * Handle button leave effect
     */
    handleButtonLeave(e) {
        const button = e.target;
        button.style.transform = 'translateY(0) scale(1)';
    }

    /**
     * Start additional animations
     */
    startAnimations() {
        // Add staggered animation to action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.5s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 1500 + (index * 200));
        });

        // Animate explanation items
        const explanationItems = document.querySelectorAll('.access-explanation li');
        explanationItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 2000 + (index * 150));
        });
    }

    /**
     * Start redirect countdown timer
     */
    startRedirectTimer() {
        const redirectNotice = document.getElementById('redirectNotice');
        const countdownElement = document.getElementById('countdown');
        
        if (!redirectNotice || !countdownElement) return;

        // Show the redirect notice
        redirectNotice.style.display = 'block';
        this.isRedirecting = true;

        this.redirectTimer = setInterval(() => {
            this.redirectCountdown--;
            countdownElement.textContent = this.redirectCountdown;

            if (this.redirectCountdown <= 0) {
                this.executeRedirect();
            }
        }, 1000);
    }

    /**
     * Cancel the redirect timer
     */
    cancelRedirect() {
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
            this.redirectTimer = null;
        }

        const redirectNotice = document.getElementById('redirectNotice');
        if (redirectNotice) {
            redirectNotice.style.animation = 'slideOutDown 0.5s ease-out';
            setTimeout(() => {
                redirectNotice.style.display = 'none';
            }, 500);
        }

        this.isRedirecting = false;
        console.log('Auto-redirect cancelled by user');
    }

    /**
     * Execute the redirect to main site
     */
    executeRedirect() {
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
        }

        console.log('Auto-redirecting to main site...');
        
        // Fade out the page
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    /**
     * Log access attempt for analytics
     */
    logAccessAttempt() {
        const timestamp = new Date().toISOString();
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        
        console.log('Access Restricted Page View:', {
            timestamp,
            userAgent,
            referrer,
            url: window.location.href
        });

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'access_restricted_view', {
                event_category: 'security',
                event_label: 'dashboard_access_denied'
            });
        }
    }

    /**
     * Add CSS animation to slide out down
     */
    addSlideOutAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOutDown {
                from {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
                to {
                    transform: translate(-50%, 100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const accessPage = new AccessRestrictedPage();
    accessPage.logAccessAttempt();
    accessPage.addSlideOutAnimation();
    
    // Make globally available
    window.accessRestrictedPage = accessPage;
});

// Add some console styling for branding
console.log('%c🛡️ Team Zorn Access Control', 'color: #ff4824; font-size: 16px; font-weight: bold;');
console.log('%cDashboard access is restricted to authorized personnel only.', 'color: #666; font-size: 12px;');
console.log('%cFor access requests, contact: teamzornhq@gmail.com', 'color: #ff0b4e; font-size: 12px;');