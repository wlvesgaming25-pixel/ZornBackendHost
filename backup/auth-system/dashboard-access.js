/**
 * Team Zorn Dashboard Access Control System
 * Verifies user authorization before allowing dashboard access
 * Integrates with the Leadership Portal Auth System
 */

class DashboardAccess {
    constructor() {
        // Check if new auth system is available
        if (window.leadershipAuth) {
            console.log('🔗 Using new Leadership Portal Auth System');
            this.useNewAuthSystem();
            return;
        }
        this.authorizedEmails = [
            // Team Leaders
            'teamzornhq@gmail.com',
            'leader@zorn.team',
            
            // Role Managers
            'creative@zorn.team',
            'competitive@zorn.team',
            'management@zorn.team',
            
            // Add additional authorized emails here
            'admin@zorn.team',
            'moderator@zorn.team'
        ];
        
        this.checkAccess();
    }

    /**
     * Use the new Leadership Portal Auth System
     */
    useNewAuthSystem() {
        console.log('🔐 Delegating to Leadership Portal Auth System...');
        
        // Disable the old system's access check
        console.log('⚠️ Old dashboard access system disabled, using Leadership Portal Auth');
        
        // Make this class available to the new system for dashboard initialization
        window.dashboardManager = this;
        
        // The new Leadership Portal Auth system will handle everything
        // This class just provides dashboard initialization services
        console.log('✅ Dashboard manager ready for Leadership Portal Auth integration');
        return; // Exit early - new auth system handles all access control
    }

    /**
     * Initialize method for Leadership Portal Auth integration
     */
    async initialize(verification, permissions) {
        console.log('🎮 Dashboard initialization called by Leadership Portal Auth');
        
        const authData = {
            user: verification,
            permissions: permissions,
            email: verification.email,
            role: verification.role,
            level: verification.level
        };
        
        return this.initializeDashboard(authData);
    }

    /**
     * Initialize dashboard with user context
     */
    initializeDashboard(authData) {
        console.log('🎮 Initializing dashboard with auth data:', authData);
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Set user context for dashboard
        if (window.dashboard) {
            window.dashboard.setUserContext(authData);
        }
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('dashboardReady', { 
            detail: authData 
        }));
    }

    /**
     * Main access verification function
     */
    async checkAccess() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Get user profile
            const user = await this.getCurrentUser();
            
            if (!user) {
                // TEMPORARY: Allow access without login for testing
                // TODO: Remove this for production
                console.log('⚠️ TEMPORARY: Allowing access without login for development');
                await this.grantTempAccess();
                return;
                
                // Production code (commented out for now):
                // await this.redirectToLogin();
                // return;
            }

            // Check if user is authorized
            if (this.isAuthorized(user.email)) {
                // Grant access
                await this.grantAccess(user);
            } else {
                // Deny access
                await this.denyAccess(user);
            }

        } catch (error) {
            console.error('Dashboard access check failed:', error);
            await this.handleAccessError();
        }
    }

    /**
     * Show loading screen with verification message
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Get current logged-in user
     */
    async getCurrentUser() {
        try {
            // Check if auth.js is available
            if (typeof window.authManager !== 'undefined') {
                return window.authManager.getCurrentUser();
            }

            // Fallback: check JWT token directly
            const token = this.getJWTToken();
            if (token) {
                return await this.validateJWTToken(token);
            }

            // Check localStorage for user data
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
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
            const response = await fetch('http://localhost:3004/api/validate-token', {
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
     * Check if user email is in authorized list
     */
    isAuthorized(email) {
        if (!email) return false;
        
        return this.authorizedEmails.some(authorizedEmail => 
            email.toLowerCase() === authorizedEmail.toLowerCase()
        );
    }

    /**
     * Grant dashboard access to authorized user
     */
    async grantAccess(user) {
        console.log('✅ Dashboard access granted for:', user.email);
        
        // Update loading text
        this.updateLoadingText('Access Granted! Loading Dashboard...');
        
        // Wait a moment for visual feedback
        await this.delay(1000);
        
        // Populate user profile in header
        this.populateUserProfile(user);
        
        // Hide loading screen and show dashboard
        this.hideLoadingScreen();
        
        // Show dashboard with fade-in effect
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) {
            setTimeout(() => {
                dashboardContainer.classList.add('show');
            }, 200);
        }

        // Initialize dashboard functionality
        if (typeof window.initializeDashboard === 'function') {
            window.initializeDashboard();
        }
    }

    /**
     * Grant temporary access for development (no login required)
     */
    async grantTempAccess() {
        console.log('🔧 Development mode: Granting temporary access');
        
        // Update loading text
        this.updateLoadingText('Development Mode - Loading Dashboard...');
        
        // Wait a moment for visual feedback
        await this.delay(1000);
        
        // Populate default user profile
        this.populateDefaultProfile();
        
        // Hide loading screen and show dashboard
        this.hideLoadingScreen();
        
        // Show dashboard with fade-in effect
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) {
            setTimeout(() => {
                dashboardContainer.classList.add('show');
            }, 200);
        }

        // Initialize dashboard functionality
        if (typeof window.initializeDashboard === 'function') {
            window.initializeDashboard();
        }
    }

    /**
     * Deny dashboard access to unauthorized user
     */
    async denyAccess(user) {
        console.log('❌ Dashboard access denied for:', user.email);
        
        // Update loading text
        this.updateLoadingText('Access Restricted...');
        
        // Wait a moment for visual feedback
        await this.delay(1000);
        
        // Redirect to access restricted page
        window.location.href = 'access-restricted.html?email=' + encodeURIComponent(user.email);
    }

    /**
     * Redirect to login page
     */
    async redirectToLogin() {
        console.log('🔐 No user logged in, redirecting to login...');
        
        this.updateLoadingText('Please log in to continue...');
        await this.delay(1500);
        
        window.location.href = 'login.html?redirect=dashboard';
    }

    /**
     * Handle access check errors
     */
    async handleAccessError() {
        console.log('⚠️ Access check error, redirecting to login...');
        
        this.updateLoadingText('Something went wrong. Redirecting...');
        await this.delay(1500);
        
        window.location.href = 'login.html';
    }

    /**
     * Update loading screen text
     */
    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Populate user profile in dashboard header
     */
    populateUserProfile(user) {
        // Set user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.username || user.global_name || user.email;
        }

        // Set user avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && user.avatar) {
            if (user.avatar.startsWith('http')) {
                userAvatar.src = user.avatar;
            } else {
                // Discord avatar URL format
                userAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            }
        } else if (userAvatar) {
            // Default avatar
            userAvatar.src = 'assets/img/default-avatar.png';
        }

        // Set user role based on email
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = this.getUserRole(user.email);
        }
    }

    /**
     * Populate default profile for development mode
     */
    populateDefaultProfile() {
        // Set default user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = 'Development User';
        }

        // Set default avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = 'assets/img/logo.png'; // Use team logo as default
        }

        // Set default role
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = 'Developer';
        }
    }

    /**
     * Determine user role based on email
     */
    getUserRole(email) {
        const emailLower = email.toLowerCase();
        
        if (emailLower.includes('leader') || emailLower === 'teamzornhq@gmail.com') {
            return 'Team Leader';
        } else if (emailLower.includes('creative')) {
            return 'Creative Manager';
        } else if (emailLower.includes('competitive')) {
            return 'Competitive Manager';
        } else if (emailLower.includes('management')) {
            return 'Management';
        } else if (emailLower.includes('admin')) {
            return 'Administrator';
        } else if (emailLower.includes('moderator')) {
            return 'Moderator';
        } else {
            return 'Authorized Staff';
        }
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Add a new authorized email (for dynamic management)
     */
    addAuthorizedEmail(email) {
        if (!this.authorizedEmails.includes(email.toLowerCase())) {
            this.authorizedEmails.push(email.toLowerCase());
            console.log('✅ Added authorized email:', email);
        }
    }

    /**
     * Remove an authorized email (for dynamic management)
     */
    removeAuthorizedEmail(email) {
        const index = this.authorizedEmails.findIndex(
            authorizedEmail => authorizedEmail.toLowerCase() === email.toLowerCase()
        );
        
        if (index !== -1) {
            this.authorizedEmails.splice(index, 1);
            console.log('❌ Removed authorized email:', email);
        }
    }

    /**
     * Get list of authorized emails (for admin interface)
     */
    getAuthorizedEmails() {
        return [...this.authorizedEmails];
    }
}

// Initialize access control when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.dashboardAccess = new DashboardAccess();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardAccess;
}