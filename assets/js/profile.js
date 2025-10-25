/**
 * Profile Management System
 * Handles profile editing, image uploads, and user preferences
 */

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.defaultAvatar = 'assets/img/roster/socialsbg.png.webp';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        this.config = new ProductionConfig();
        
        // Wait a bit for authManager to load, then initialize
        setTimeout(() => this.init(), 200);
    }

    async init() {
        console.log('🔄 Profile manager initializing...');
        
        // Try multiple sources to get user data
        this.currentUser = await this.loadUserFromAllSources();
        
        console.log('📋 Final user state:', this.currentUser);
        
        // Always initialize the profile interface, whether user is logged in or not
        this.loadUserData();
        this.bindEvents();
        this.updateProfileDisplay(this.currentUser);
        this.updateProfilePreview();
        
        console.log('✅ Profile manager initialized');
    }

    async loadUserFromAllSources() {
        let user = null;
        
        console.log('🔍 Starting comprehensive user detection...');
        
        // 1. Check auth manager first (this is what main.js uses)
        if (window.authManager && window.authManager.currentUser) {
            user = window.authManager.currentUser;
            console.log('👤 User from auth manager:', user);
            return user;
        }
        
        // 2. Try to get user data from authManager directly
        if (window.authManager && typeof window.authManager.getUserData === 'function') {
            user = window.authManager.getUserData();
            if (user) {
                console.log('📊 User from authManager.getUserData():', user);
                return user;
            }
        }
        
        // 3. Wait a bit for authManager to load and try again
        await this.waitForAuthManager();
        if (window.authManager && window.authManager.currentUser) {
            user = window.authManager.currentUser;
            console.log('⏳ User from auth manager (after wait):', user);
            return user;
        }
        
        // 4. Check localStorage session (what authManager uses)
        try {
            const session = localStorage.getItem('zorn_user_session');
            if (session) {
                user = JSON.parse(session);
                console.log('💾 User from localStorage session:', user);
                if (this.isValidUser(user)) return user;
            }
        } catch (e) {
            console.warn('⚠️ Failed to parse localStorage session:', e);
        }
        
        // 5. Check our custom currentUser storage
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                user = JSON.parse(stored);
                console.log('📦 User from currentUser storage:', user);
                if (this.isValidUser(user)) return user;
            }
        } catch (e) {
            console.warn('⚠️ Failed to parse currentUser storage:', e);
        }
        
        // 6. Try OAuth token
        try {
            user = await this.loadOAuthUser();
            if (user) {
                console.log('🔐 User from OAuth:', user);
                return user;
            }
        } catch (e) {
            console.warn('⚠️ OAuth user load failed:', e);
        }
        
        // 7. Return null if no user found (guest mode)
        console.log('👻 No user found - using guest mode');
        return null;
    }

    async waitForAuthManager(maxAttempts = 20) {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkAuthManager = () => {
                attempts++;
                if (window.authManager && window.authManager.currentUser) {
                    console.log(`✅ AuthManager found after ${attempts} attempts`);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.log(`❌ AuthManager not found after ${maxAttempts} attempts`);
                    resolve(false);
                } else {
                    setTimeout(checkAuthManager, 100);
                }
            };
            checkAuthManager();
        });
    }

    isValidUser(user) {
        return user && (user.email || user.username || user.displayName);
    }

    // Load OAuth user from JWT token
    async loadOAuthUser() {
        try {
            console.log('Attempting to load OAuth user from token...');
            const response = await fetch(`${this.config.getOAuthUrl()}/api/auth/me`, {
                method: 'GET',
                credentials: 'include', // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('OAuth API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('OAuth API response data:', data);
                
                if (data.success && data.user) {
                    return {
                        ...data.user,
                        loginTime: Date.now(),
                        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
                    };
                }
            } else {
                console.log('OAuth API response not ok:', await response.text());
            }
        } catch (error) {
            console.error('Failed to load OAuth user:', error);
        }
        return null;
    }

    loadUserData() {
        // Load user data from localStorage or use current user data
        let userData = localStorage.getItem(`user_${this.currentUser.id}`);
        let user;
        
        if (userData) {
            user = JSON.parse(userData);
            // Merge with current user data to ensure we have all fields
            user = { ...this.currentUser, ...user };
        } else {
            // Use current user data if no specific profile data exists
            user = this.currentUser;
        }
        
        console.log('Loading user data:', user);
        this.populateForm(user);
        
        // Force another profile display update after loading data
        this.updateProfileDisplay(user);
    }

    populateForm(user) {
        // Basic Information
        const usernameField = document.getElementById('username');
        const emailField = document.getElementById('email');
        const displayNameField = document.getElementById('displayName');
        const bioField = document.getElementById('bio');

        if (usernameField) usernameField.value = user.username || '';
        if (emailField) emailField.value = user.email || '';
        if (displayNameField) displayNameField.value = user.displayName || '';
        if (bioField) bioField.value = user.bio || '';

        // Profile Picture
        if (user.avatar) {
            this.updateAvatarDisplay(user.avatar);
        }

        // Preferences
        const emailNotifications = document.getElementById('emailNotifications');
        const browserNotifications = document.getElementById('browserNotifications');
        const profilePublic = document.getElementById('profilePublic');
        const showEmail = document.getElementById('showEmail');

        if (emailNotifications) emailNotifications.checked = user.preferences?.emailNotifications !== false;
        if (browserNotifications) browserNotifications.checked = user.preferences?.browserNotifications !== false;
        if (profilePublic) profilePublic.checked = user.preferences?.profilePublic !== false;
        if (showEmail) showEmail.checked = user.preferences?.showEmail === true;

        // Update profile preview
        this.updateProfileDisplay(user);
    }

    updateProfileDisplay(user) {
        console.log('🎨 Updating profile display with user:', user);
        
        // Handle guest user vs logged-in user
        const isGuest = !user || !this.isValidUser(user);
        
        // Determine display values
        let displayName, email, joinDate;
        
        if (isGuest) {
            displayName = 'Guest User';
            email = 'Not logged in';
            joinDate = '--';
        } else {
            displayName = user.displayName || user.username || user.global_name || 
                         `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
            email = user.email || 'No email provided';
            joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 
                      user.loginTime ? new Date(user.loginTime).toLocaleDateString() : 
                      new Date().toLocaleDateString();
        }

        console.log('📄 Display data:', { displayName, email, joinDate, isGuest });

        // Update profile overview section
        const nameDisplay = document.getElementById('profileNameDisplay');
        const emailDisplay = document.getElementById('profileEmailDisplay');
        const joinDateDisplay = document.getElementById('joinDateDisplay');

        // Force update and prevent flickering
        if (nameDisplay) {
            nameDisplay.textContent = displayName;
            nameDisplay.style.opacity = '1';
        }
        
        if (emailDisplay) {
            emailDisplay.textContent = email;
            emailDisplay.style.opacity = '1';
        }
        
        if (joinDateDisplay) {
            joinDateDisplay.textContent = joinDate;
            joinDateDisplay.style.opacity = '1';
        }
        
        // Update profile form fields if user is logged in
        if (!isGuest) {
            this.populateFormFields(user);
        } else {
            this.clearFormFields();
        }
        
        console.log('✅ Profile display updated successfully');
    }

    populateFormFields(user) {
        // Update form fields with user data
        const fields = {
            'username': user.username || user.global_name || '',
            'email': user.email || '',
            'displayName': user.displayName || user.global_name || '',
            'bio': user.bio || ''
        };
        
        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
                console.log(`📝 Updated field ${fieldId}:`, value);
            }
        });
    }

    clearFormFields() {
        // Clear form fields for guest users
        const fieldIds = ['username', 'email', 'displayName', 'bio'];
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                field.placeholder = field.placeholder.replace('Enter your', 'Please log in to set your');
            }
        });
    }

    bindEvents() {
        // Avatar upload
        const avatarUpload = document.getElementById('avatarUpload');
        const profileAvatarPreview = document.getElementById('profileAvatarPreview');
        const profilePreview = document.querySelector('.profile-preview');
        const removeAvatar = document.getElementById('removeAvatar');

        console.log('Binding events - Elements found:', {
            avatarUpload: !!avatarUpload,
            profileAvatarPreview: !!profileAvatarPreview,
            removeAvatar: !!removeAvatar
        });

        if (avatarUpload) {
            avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        if (profileAvatarPreview) {
            profileAvatarPreview.addEventListener('click', (e) => {
                console.log('Profile avatar clicked!');
                e.preventDefault();
                e.stopPropagation();
                if (avatarUpload) {
                    console.log('Triggering file input click');
                    avatarUpload.click();
                } else {
                    console.error('Avatar upload input not found');
                }
            });
            console.log('Profile avatar click event bound successfully');
        } else {
            console.error('Profile avatar preview element not found');
        }



        if (removeAvatar) {
            removeAvatar.addEventListener('click', () => this.removeAvatar());
        }

        // Form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Action buttons
        const saveProfile = document.getElementById('saveProfile');
        const resetProfile = document.getElementById('resetProfile');
        const changePassword = document.getElementById('changePassword');
        const logoutBtn = document.getElementById('logoutBtn');

        if (saveProfile) {
            saveProfile.addEventListener('click', () => this.saveProfile());
        }

        if (resetProfile) {
            resetProfile.addEventListener('click', () => this.resetProfile());
        }

        if (changePassword) {
            changePassword.addEventListener('click', () => this.changePassword());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Real-time validation
        const usernameField = document.getElementById('username');
        const emailField = document.getElementById('email');

        if (usernameField) {
            usernameField.addEventListener('input', () => this.validateUsername());
        }

        if (emailField) {
            emailField.addEventListener('input', () => this.validateEmail());
        }

        // Bio character counter
        const bioField = document.getElementById('bio');
        if (bioField) {
            bioField.addEventListener('input', () => this.updateBioCounter());
            this.updateBioCounter(); // Initial call
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        // Show loading state
        this.showAvatarLoading(true);

        // Create file reader
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.updateAvatarDisplay(imageData);
            
            // Save the avatar to user data
            this.saveAvatarData(imageData);
            
            this.showAvatarLoading(false);
            NotificationManager.show('Profile picture updated successfully!', 'success');
        };

        reader.onerror = () => {
            this.showAvatarLoading(false);
            NotificationManager.show('Error reading file. Please try again.', 'error');
        };

        reader.readAsDataURL(file);
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            NotificationManager.show('File size must be less than 5MB', 'error');
            return false;
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            NotificationManager.show('Please upload a valid image file (JPG, PNG, WebP, GIF)', 'error');
            return false;
        }

        return true;
    }

    updateAvatarDisplay(imageData) {
        const avatarElements = [
            document.getElementById('profileAvatarPreview'),
            document.getElementById('currentAvatar')
        ];

        avatarElements.forEach(element => {
            if (element) {
                element.src = imageData;
            }
        });

        // Update header avatar if present
        const headerAvatar = document.querySelector('.user-avatar');
        if (headerAvatar) {
            headerAvatar.src = imageData;
        }
    }

    showAvatarLoading(loading) {
        const avatarPreview = document.getElementById('profileAvatarPreview');
        if (avatarPreview) {
            if (loading) {
                avatarPreview.style.opacity = '0.6';
                avatarPreview.style.pointerEvents = 'none';
            } else {
                avatarPreview.style.opacity = '1';
                avatarPreview.style.pointerEvents = 'auto';
            }
        }
    }

    saveAvatarData(imageData) {
        // Update current user object
        this.currentUser.avatar = imageData;
        
        // Save to user-specific storage
        const existingData = localStorage.getItem(`user_${this.currentUser.id}`);
        let userData = existingData ? JSON.parse(existingData) : {};
        userData.avatar = imageData;
        localStorage.setItem(`user_${this.currentUser.id}`, JSON.stringify(userData));
        
        // Update session with new avatar
        window.authManager.saveSession(this.currentUser);
    }

    removeAvatar() {
        this.updateAvatarDisplay(this.defaultAvatar);
        this.saveAvatarData(this.defaultAvatar);
        
        const avatarUpload = document.getElementById('avatarUpload');
        if (avatarUpload) {
            avatarUpload.value = '';
        }
        NotificationManager.show('Profile picture removed', 'success');
    }

    validateUsername() {
        const usernameField = document.getElementById('username');
        if (!usernameField) return;

        const username = usernameField.value.trim();
        const formGroup = usernameField.closest('.form-group');
        
        // Remove existing messages
        const existingMessage = formGroup.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (username.length < 3) {
            this.showFieldError(formGroup, 'Username must be at least 3 characters long');
            return false;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            this.showFieldError(formGroup, 'Username can only contain letters, numbers, hyphens, and underscores');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Username is available');
        return true;
    }

    validateEmail() {
        const emailField = document.getElementById('email');
        if (!emailField) return;

        const email = emailField.value.trim();
        const formGroup = emailField.closest('.form-group');
        
        // Remove existing messages
        const existingMessage = formGroup.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFieldError(formGroup, 'Please enter a valid email address');
            return false;
        }

        this.showFieldSuccess(formGroup, 'Email format is valid');
        return true;
    }

    showFieldError(formGroup, message) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'validation-message error-message';
        messageElement.textContent = message;
        formGroup.appendChild(messageElement);
    }

    showFieldSuccess(formGroup, message) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'validation-message success-message';
        messageElement.textContent = message;
        formGroup.appendChild(messageElement);
    }

    updateBioCounter() {
        const bioField = document.getElementById('bio');
        if (!bioField) return;

        const maxLength = 500;
        const currentLength = bioField.value.length;
        const formGroup = bioField.closest('.form-group');
        
        // Find or create counter
        let counter = formGroup.querySelector('.char-counter');
        if (!counter) {
            counter = document.createElement('small');
            counter.className = 'char-counter form-help';
            formGroup.appendChild(counter);
        }

        counter.textContent = `${currentLength}/${maxLength} characters`;
        
        if (currentLength > maxLength) {
            counter.style.color = '#dc3545';
            bioField.style.borderColor = '#dc3545';
        } else {
            counter.style.color = '#666';
            bioField.style.borderColor = '#e1e5e9';
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        this.saveProfile();
    }

    saveProfile() {
        // Validate form
        const isUsernameValid = this.validateUsername();
        const isEmailValid = this.validateEmail();

        if (!isUsernameValid || !isEmailValid) {
            NotificationManager.show('Please fix the errors before saving', 'error');
            return;
        }

        // Show loading state
        const saveBtn = document.getElementById('saveProfile');
        if (saveBtn) {
            saveBtn.classList.add('loading');
        }

        // Collect form data
        const formData = this.collectFormData();
        
        // Simulate API call with timeout
        setTimeout(() => {
            this.saveUserData(formData);
            
            if (saveBtn) {
                saveBtn.classList.remove('loading');
            }
            
            NotificationManager.show('Profile saved successfully!', 'success');
            this.updateProfilePreview();
        }, 1000);
    }

    collectFormData() {
        const username = document.getElementById('username')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const displayName = document.getElementById('displayName')?.value.trim() || '';
        const bio = document.getElementById('bio')?.value.trim() || '';
        
        const avatar = document.getElementById('profileAvatarPreview')?.src || this.defaultAvatar;
        
        const preferences = {
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            browserNotifications: document.getElementById('browserNotifications')?.checked || false,
            profilePublic: document.getElementById('profilePublic')?.checked || false,
            showEmail: document.getElementById('showEmail')?.checked || false
        };

        return {
            ...this.currentUser,
            username,
            email,
            displayName,
            bio,
            avatar,
            preferences,
            lastUpdated: new Date().toISOString()
        };
    }

    saveUserData(userData) {
        try {
            console.log('💾 Saving user data:', userData);
            
            // Update current user object
            this.currentUser = { ...this.currentUser, ...userData };
            
            // Save to multiple storage locations for persistence
            const userToSave = {
                ...this.currentUser,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to main session storage
            localStorage.setItem('zorn_user_session', JSON.stringify(userToSave));
            
            // Save to currentUser storage (for dashboard access)
            localStorage.setItem('currentUser', JSON.stringify(userToSave));
            
            // Save to specific user storage if we have an ID or email
            const userKey = userToSave.id || userToSave.email || 'default_user';
            localStorage.setItem(`user_${userKey}`, JSON.stringify(userToSave));
            
            // Update auth manager if available
            if (window.authManager && typeof window.authManager.updateCurrentUser === 'function') {
                window.authManager.updateCurrentUser(userToSave);
            }
            
            // Update profile display immediately
            this.updateProfileDisplay(userToSave);
            
            // Update header if it exists
            this.updateHeaderProfile(userToSave);
            
            console.log('✅ User data saved successfully');
            
            // Show success message
            this.showNotification('Profile saved successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to save user data:', error);
            this.showNotification('Failed to save profile. Please try again.', 'error');
        }
    }

    updateHeaderProfile(userData) {
        const headerAvatar = document.querySelector('.user-avatar');
        const headerName = document.querySelector('.user-name');
        
        if (headerAvatar && userData.avatar) {
            headerAvatar.src = userData.avatar;
        }
        
        if (headerName) {
            headerName.textContent = userData.displayName || userData.username;
        }
    }

    updateProfilePreview() {
        if (this.currentUser) {
            const userData = JSON.parse(localStorage.getItem(`user_${this.currentUser.id}`) || '{}');
            this.updateProfileDisplay({ ...this.currentUser, ...userData });
        }
    }

    resetProfile() {
        if (confirm('Are you sure you want to reset all profile settings to default? This cannot be undone.')) {
            // Clear saved data
            localStorage.removeItem(`user_${this.currentUser.id}`);
            
            // Reset form
            const form = document.getElementById('profileForm');
            if (form) {
                form.reset();
            }
            
            // Reset avatar
            this.updateAvatarDisplay(this.defaultAvatar);
            
            // Reset preferences to defaults
            document.getElementById('emailNotifications').checked = true;
            document.getElementById('browserNotifications').checked = true;
            document.getElementById('profilePublic').checked = true;
            document.getElementById('showEmail').checked = false;
            
            NotificationManager.show('Profile reset to defaults', 'success');
        }
    }

    changePassword() {
        // In a real app, this would open a password change modal or redirect to a secure page
        NotificationManager.show('Password change functionality would open here', 'info');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('User confirmed logout');
            if (window.authManager) {
                window.authManager.logout();
            } else {
                console.error('AuthManager not available');
                // Fallback logout
                localStorage.removeItem('zorn_user_session');
                window.location.href = 'login.html';
            }
        }
    }

    showNotification(message, type = 'info') {
        // Try to use NotificationManager if available
        if (window.NotificationManager && typeof window.NotificationManager.show === 'function') {
            window.NotificationManager.show(message, type);
        } else {
            // Fallback to simple alert or console
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Create a simple notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                ${type === 'success' ? 'background: #22c55e;' : 
                  type === 'error' ? 'background: #ef4444;' : 'background: #3b82f6;'}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize notification system (NotificationManager is defined in auth.js)
    NotificationManager.init();
    
    // Initialize profile manager
    new ProfileManager();
});