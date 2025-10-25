/**
 * Authentication Management System
 * Handles login, registration, session management, and user state
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'zorn_user_session';
        this.users = JSON.parse(localStorage.getItem('zorn_users') || '{}');
        this.init();
    }

    init() {
        // Check for OAuth callback results first
        this.checkOAuthResult();
        
        // Try to load from JWT token (OAuth users)
        this.loadUserFromToken().then(loaded => {
            if (!loaded) {
                // Fallback to local session (regular users)
                this.loadSession();
            }
            this.bindEvents();
            return this.updateUI();
        });
    }

    // Session Management
    loadSession() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                // Validate session is still valid (not expired)
                if (this.isSessionValid()) {
                    return;
                }
            } catch (e) {
                console.error('Invalid session data');
            }
        }
        this.currentUser = null;
        localStorage.removeItem(this.sessionKey);
    }

    saveSession(user) {
        const sessionData = {
            ...user,
            loginTime: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        this.currentUser = sessionData;
    }

    isSessionValid() {
        if (!this.currentUser) return false;
        return Date.now() < (this.currentUser.expiresAt || 0);
    }

    // Event Binding
    bindEvents() {
        // Only bind events if we're on the login page
        if (window.location.pathname.includes('login.html')) {
            this.bindLoginEvents();
        }
    }

    bindLoginEvents() {
        // Tab switching
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        
        if (loginTab) {
            loginTab.addEventListener('click', () => this.switchTab('login'));
        }
        if (registerTab) {
            registerTab.addEventListener('click', () => this.switchTab('register'));
        }

        // Form submissions
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password toggles
        const loginPasswordToggle = document.getElementById('toggleLoginPassword');
        const registerPasswordToggle = document.getElementById('toggleRegisterPassword');

        if (loginPasswordToggle) {
            loginPasswordToggle.addEventListener('click', () => this.togglePassword('loginPassword'));
        }
        if (registerPasswordToggle) {
            registerPasswordToggle.addEventListener('click', () => this.togglePassword('registerPassword'));
        }

        // Real-time validation for register form
        const registerEmail = document.getElementById('registerEmail');
        const registerUsername = document.getElementById('registerUsername');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (registerEmail) {
            registerEmail.addEventListener('blur', () => this.validateEmail('registerEmail'));
        }
        if (registerUsername) {
            registerUsername.addEventListener('blur', () => this.validateUsername('registerUsername'));
        }
        if (registerPassword) {
            registerPassword.addEventListener('input', () => this.checkPasswordStrength());
        }
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }

        // Social login buttons
        this.bindSocialLogin();
    }

    bindSocialLogin() {
        const socialButtons = ['discordLogin', 'discordRegister'];
        
        socialButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.initiateOAuthLogin('discord');
                });
            }
        });
    }

    // Tab Switching
    switchTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (tab === 'login') {
            loginTab?.classList.add('active');
            registerTab?.classList.remove('active');
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
        } else {
            registerTab?.classList.add('active');
            loginTab?.classList.remove('active');
            registerForm?.classList.remove('hidden');
            loginForm?.classList.add('hidden');
        }
    }

    // Password Toggle
    togglePassword(fieldId) {
        const field = document.getElementById(fieldId);
        const toggle = document.getElementById(`toggle${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        
        if (field && toggle) {
            const isPassword = field.type === 'password';
            field.type = isPassword ? 'text' : 'password';
            toggle.classList.toggle('active', isPassword);
        }
    }

    // Login Handling
    async handleLogin(event) {
        event.preventDefault();
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.classList.add('loading');

        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        try {
            // Simulate API delay
            await this.delay(1000);
            
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.saveSession(user);
                NotificationManager.show('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                NotificationManager.show('Invalid email/username or password', 'error');
            }
        } catch (error) {
            NotificationManager.show('Login failed. Please try again.', 'error');
        } finally {
            if (loginBtn) loginBtn.classList.remove('loading');
        }
    }

    // Registration Handling
    async handleRegister(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) registerBtn.classList.add('loading');

        // Get values from form fields - use actual user input
        const firstName = document.getElementById('firstName')?.value?.trim() || '';
        const lastName = document.getElementById('lastName')?.value?.trim() || '';
        const username = document.getElementById('registerUsername')?.value?.trim();
        const email = document.getElementById('registerEmail')?.value?.trim();
        const password = document.getElementById('registerPassword')?.value;
        
        // Validate required fields
        if (!username) {
            NotificationManager.show('Username is required', 'error');
            if (registerBtn) registerBtn.classList.remove('loading');
            return;
        }
        
        if (!email) {
            NotificationManager.show('Email is required', 'error');
            if (registerBtn) registerBtn.classList.remove('loading');
            return;
        }
        
        if (!password) {
            NotificationManager.show('Password is required', 'error');
            if (registerBtn) registerBtn.classList.remove('loading');
            return;
        }
        const marketingEmails = document.getElementById('marketingEmails')?.checked || false;
        
        // Create user data object
        const userData = {
            firstName,
            lastName,
            username,
            email,
            password,
            marketingEmails
        };
        
        console.log('Creating user with data:', { 
            firstName, 
            lastName, 
            username, 
            email, 
            password: '[HIDDEN]',
            marketingEmails
        });

        try {
            // Try to create user
            let user = this.createUser(userData);
            console.log('User creation result:', user ? 'SUCCESS' : 'FAILED');
            
            // If user creation failed (already exists), try to login instead
            if (!user) {
                console.log('User already exists, attempting login...');
                user = this.authenticateUser(userData.email, userData.password);
                if (!user) {
                    user = this.authenticateUser(userData.username, userData.password);
                }
            }
            
            if (user) {
                console.log('Saving session and redirecting...');
                this.saveSession(user);
                
                // Force UI update immediately
                this.updateUI();
                this.updateHeaderUI();
                
                NotificationManager.show('Welcome to Zorn!', 'success');
                
                // Small delay to ensure session is saved
                setTimeout(() => {
                    console.log('Redirecting to profile page...');
                    window.location.href = 'profile.html';
                }, 500);
            } else {
                console.log('Both user creation and login failed');
                NotificationManager.show('Registration failed. Please try different credentials.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            NotificationManager.show('Registration failed. Please try again.', 'error');
        } finally {
            if (registerBtn) registerBtn.classList.remove('loading');
        }
    }

    // User Authentication
    authenticateUser(emailOrUsername, password) {
        const users = this.users;
        
        // Find user by email or username
        const user = Object.values(users).find(u => 
            (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
        );

        if (user) {
            // Return user data without password
            const { password: _, ...safeUser } = user;
            return safeUser;
        }
        
        return null;
    }

    // User Creation
    createUser(userData) {
        // Check if email or username already exists
        const existingUser = Object.values(this.users).find(u => 
            u.email === userData.email || u.username === userData.username
        );

        if (existingUser) {
            if (existingUser.email === userData.email) {
                NotificationManager.show('An account with this email already exists', 'error');
            } else {
                NotificationManager.show('This username is already taken', 'error');
            }
            return null;
        }

        // Create new user
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
            id: userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            password: userData.password, // In real app, this should be hashed
            avatar: 'assets/img/roster/socialsbg.png.webp',
            displayName: userData.username,
            bio: '',
            joinDate: new Date().toISOString(),
            preferences: {
                emailNotifications: true,
                browserNotifications: true,
                profilePublic: true,
                showEmail: false,
                marketingEmails: userData.marketingEmails
            },
            isActive: true
        };
        
        console.log('Created new user object:', {
            ...newUser,
            password: '[HIDDEN]'
        });

        // Save user
        this.users[userId] = newUser;
        localStorage.setItem('zorn_users', JSON.stringify(this.users));

        // Return user without password
        const { password: _, ...safeUser } = newUser;
        return safeUser;
    }

    // Form Validation
    validateRegisterForm() {
        let isValid = true;

        // Check required fields with detailed logging
        const requiredFields = ['firstName', 'lastName', 'registerUsername', 'registerEmail', 'registerPassword', 'confirmPassword'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field?.value.trim();
            console.log(`Field ${fieldId}:`, field ? 'found' : 'NOT FOUND', 'Value:', value || 'EMPTY');
            
            if (!field?.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
        });

        // Validate email
        if (!this.validateEmail('registerEmail')) {
            isValid = false;
        }

        // Validate username
        if (!this.validateUsername('registerUsername')) {
            isValid = false;
        }

        // Validate password match
        if (!this.validatePasswordMatch()) {
            isValid = false;
        }

        // Terms validation is handled in handleRegister method

        return isValid;
    }

    validateEmail(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return false;

        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        // Check if email is already registered (for register form)
        if (fieldId === 'registerEmail') {
            const existingUser = Object.values(this.users).find(u => u.email === email);
            if (existingUser) {
                this.showFieldError(field, 'This email is already registered');
                return false;
            }
        }

        this.showFieldSuccess(field, 'Email is valid');
        return true;
    }

    validateUsername(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return false;

        const username = field.value.trim();
        
        if (username.length < 3) {
            this.showFieldError(field, 'Username must be at least 3 characters long');
            return false;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            this.showFieldError(field, 'Username can only contain letters, numbers, hyphens, and underscores');
            return false;
        }

        // Check if username is already taken (for register form)
        if (fieldId === 'registerUsername') {
            const existingUser = Object.values(this.users).find(u => u.username === username);
            if (existingUser) {
                this.showFieldError(field, 'This username is already taken');
                return false;
            }
        }

        this.showFieldSuccess(field, 'Username is available');
        return true;
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!confirmPassword) return false;

        if (password !== confirmPassword.value) {
            this.showFieldError(confirmPassword, 'Passwords do not match');
            return false;
        }

        if (confirmPassword.value) {
            this.showFieldSuccess(confirmPassword, 'Passwords match');
        }
        return true;
    }

    checkPasswordStrength() {
        const password = document.getElementById('registerPassword')?.value || '';
        const strengthMeter = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthMeter || !strengthText) return;

        let strength = 0;
        let strengthLabel = 'Very Weak';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthMeter.className = 'strength-fill weak';
                strengthLabel = 'Weak';
                break;
            case 2:
            case 3:
                strengthMeter.className = 'strength-fill fair';
                strengthLabel = 'Fair';
                break;
            case 4:
                strengthMeter.className = 'strength-fill good';
                strengthLabel = 'Good';
                break;
            case 5:
                strengthMeter.className = 'strength-fill strong';
                strengthLabel = 'Strong';
                break;
        }

        strengthText.textContent = `Password strength: ${strengthLabel}`;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        // Remove existing message
        const existingMessage = formGroup.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add error message
        const messageElement = document.createElement('div');
        messageElement.className = 'error-message';
        messageElement.textContent = message;
        formGroup.appendChild(messageElement);
    }

    showFieldSuccess(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        
        // Remove existing messages
        const existingMessage = formGroup.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add success message
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.textContent = message;
        formGroup.appendChild(messageElement);
    }

    // OAuth Login
    initiateOAuthLogin(platform) {
        // Store current page to redirect back after login
        localStorage.setItem('auth_redirect', window.location.pathname);
        
        // Redirect to OAuth handler
        const authUrl = `${this.getApiBaseUrl()}/auth/${platform}`;
        window.location.href = authUrl;
    }

    getApiBaseUrl() {
        // Use ProductionConfig if available, fallback to localhost
        if (window.ProductionConfig) {
            return window.ProductionConfig.getOAuthUrl();
        }
        return 'http://localhost:3004';
    }

    // Check for OAuth login results
    checkOAuthResult() {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        
        console.log('Checking OAuth result:', { success, error });

        if (success) {
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show success message
            NotificationManager.show(`Successfully logged in with Discord! Redirecting to profile...`, 'success');
            
            // Always redirect to profile page regardless of token loading
            setTimeout(() => {
                console.log('Redirecting to profile page...');
                window.location.href = 'profile.html';
            }, 2000); // Give 2 seconds to see the success message
            
            // Load user session in background
            this.loadUserFromToken().then((loaded) => {
                console.log('User loaded from token:', loaded);
            }).catch(error => {
                console.error('Error loading user from token:', error);
            });
        }

        if (error) {
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show error message
            let errorMessage = 'Discord authentication failed. Please try again.';
            
            NotificationManager.show(errorMessage, 'error');
        }
    }

    // Load user from JWT token (cookie-based)
    async loadUserFromToken() {
        try {
            console.log('Attempting to load user from token...');
            const response = await fetch(`${this.getApiBaseUrl()}/api/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Token response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Token response data:', data);
                
                if (data.success && data.user) {
                    this.currentUser = {
                        ...data.user,
                        loginTime: Date.now(),
                        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
                    };
                    console.log('User loaded successfully:', this.currentUser);
                    this.updateUI();
                    return true;
                }
            } else {
                console.log('Token response not ok:', await response.text());
            }
        } catch (error) {
            console.error('Failed to load user from token:', error);
        }
        return false;
    }

    // OAuth Logout
    async performOAuthLogout() {
        try {
            await fetch(`${this.getApiBaseUrl()}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('OAuth logout failed:', error);
        }
    }

    // UI Updates
    async updateUI() {
        // Check for OAuth user if no current user
        if (!this.currentUser) {
            const oauthUser = await this.loadUserFromToken();
            if (oauthUser) {
                this.currentUser = oauthUser;
                console.log('Loaded OAuth user in updateUI:', this.currentUser);
            }
        }
        
        // This will be called from main.js to update the header
        this.updateHeaderUI();
    }

    updateHeaderUI() {
        const userProfile = document.getElementById('userProfile');
        if (!userProfile) return;

        if (this.currentUser) {
            // User is logged in - show profile
            const userData = this.getUserData();
            userProfile.innerHTML = `
                <a href="profile.html" class="user-profile-link">
                    <img src="${userData.avatar || 'assets/img/roster/socialsbg.png.webp'}" alt="Profile" class="user-avatar">
                    <span class="user-name">${userData.displayName || userData.username}</span>
                </a>
            `;
        } else {
            // User is not logged in - show placeholder profile picture
            userProfile.innerHTML = `
                <a href="login.html" class="user-profile-link">
                    <img src="assets/img/roster/socialsbg.png.webp" alt="Login" class="user-avatar placeholder">
                    <span class="user-name">Guest</span>
                </a>
            `;
        }
    }

    // Utility Methods
    getUserData() {
        if (!this.currentUser) return null;
        
        const savedData = localStorage.getItem(`user_${this.currentUser.id}`);
        if (savedData) {
            return { ...this.currentUser, ...JSON.parse(savedData) };
        }
        return this.currentUser;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Static Methods (for use by other modules)
    static getCurrentUser() {
        const instance = window.authManager || new AuthManager();
        return instance.currentUser;
    }

    static updateCurrentUser(userData) {
        const instance = window.authManager || new AuthManager();
        if (instance.currentUser) {
            instance.currentUser = { ...instance.currentUser, ...userData };
            instance.saveSession(instance.currentUser);
        }
    }

    async logout() {
        console.log('Logout process started');
        
        // If user is OAuth user, logout from backend too
        if (this.currentUser && this.currentUser.provider) {
            await this.performOAuthLogout();
        }
        
        // Clear session data
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
        
        // Clear all user data
        this.updateUI();
        this.updateHeaderUI();
        
        console.log('Session cleared, redirecting to login');
        NotificationManager.show('Logged out successfully', 'success');
        
        // Redirect to login page after short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    static logout() {
        const instance = window.authManager || new AuthManager();
        instance.logout();
    }

    static requireAuth() {
        const instance = window.authManager || new AuthManager();
        if (!instance.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Notification Manager
class NotificationManager {
    static show(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notificationMessage');
        
        if (!notification || !messageElement) {
            // Fallback to alert if notification system not available
            alert(message);
            return;
        }
        
        messageElement.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    static init() {
        const closeBtn = document.getElementById('notificationClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const notification = document.getElementById('notification');
                if (notification) {
                    notification.classList.remove('show');
                }
            });
        }
    }
}

// Initialize Auth Manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    NotificationManager.init();
});