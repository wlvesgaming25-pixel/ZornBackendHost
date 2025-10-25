/**
 * Team Zorn Leadership Portal - Secure Access Verification System
 * Comprehensive email-based authentication with management verification
 */

class LeadershipPortalAuth {
    constructor() {
        // Management emails with role-based access levels
        this.managementRegistry = {
            // Core Leadership (Full Access)
            'teamzornhq@gmail.com': {
                role: 'Owner',
                level: 'admin',
                permissions: ['view', 'edit', 'delete', 'manage_users', 'system_config'],
                active: true,
                verified: true
            },
            'placeholder@zorn.team': {
                role: 'Team Leader',
                level: 'admin', 
                permissions: ['view', 'edit', 'delete', 'manage_users'],
                active: true,
                verified: true
            },

            // Department Managers (Department Access)
            'ticklemybootey@gmail.com': {
                role: 'Creative Director',
                level: 'manager',
                permissions: ['view', 'edit', 'delete'],
                departments: ['designer', 'editor', 'creator'],
                active: true,
                verified: true
            },
            'monty@zorn.team': {
                role: 'Competitive Manager',
                level: 'manager',
                permissions: ['view', 'edit', 'delete'],
                departments: ['competitive-player', 'freestyler', 'coach'],
                active: true,
                verified: true
            },
            'management@zorn.team': {
                role: 'Operations Manager',
                level: 'manager',
                permissions: ['view', 'edit', 'delete'],
                departments: ['management', 'other'],
                active: true,
                verified: true
            },

            // Additional Management (Limited Access)
            'admin@zorn.team': {
                role: 'System Admin',
                level: 'admin',
                permissions: ['view', 'edit', 'system_config'],
                active: true,
                verified: false // Requires verification
            },
            'moderator@zorn.team': {
                role: 'Moderator',
                level: 'moderator',
                permissions: ['view', 'edit'],
                active: true,
                verified: false // Requires verification
            }
        };

        // Security settings
        this.security = {
            sessionTimeout: 3600000, // 1 hour
            maxFailedAttempts: 3,
            lockoutDuration: 900000, // 15 minutes
            requireVerification: true,
            enableLogging: true
        };

        // Access logs
        this.accessLogs = [];
        
        this.init();
    }

    /**
     * Initialize the authentication system
     */
    async init() {
        console.log('🔐 Initializing Leadership Portal Security System...');
        
        try {
            // Load existing logs
            this.loadAccessLogs();
            
            // Verify system integrity
            await this.verifySystemIntegrity();
            
            // Check current access
            await this.performAccessCheck();
            
        } catch (error) {
            console.error('❌ Authentication system initialization failed:', error);
            this.handleSystemError(error);
        }
    }

    /**
     * Perform comprehensive access verification
     */
    async performAccessCheck() {
        console.log('🔍 Performing access verification...');
        
        this.showVerificationScreen();
        
        try {
            // Step 1: Get current user
            const user = await this.getCurrentUser();
            
            // Step 2: Verify user credentials
            const verification = await this.verifyUserAccess(user);
            
            // Step 3: Check permissions
            const permissions = this.checkPermissions(verification);
            
            // Step 4: Grant or deny access
            if (verification.authorized && permissions.valid) {
                await this.grantPortalAccess(verification, permissions);
            } else {
                await this.denyPortalAccess(verification, permissions);
            }
            
        } catch (error) {
            console.error('❌ Access verification failed:', error);
            await this.handleAccessError(error);
        } finally {
            this.hideVerificationScreen();
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        console.log('👤 Retrieving current user...');
        
        try {
            // Check multiple authentication sources
            let user = null;

            // Method 1: Check auth.js integration
            if (typeof window.authManager !== 'undefined') {
                user = await window.authManager.getCurrentUser();
                if (user) {
                    console.log('✅ User found via AuthManager:', user.email);
                    return user;
                }
            }

            // Method 2: Check JWT token
            const token = this.getStoredToken();
            if (token) {
                user = await this.validateJWTToken(token);
                if (user) {
                    console.log('✅ User found via JWT:', user.email);
                    return user;
                }
            }

            // Method 3: Check session storage
            const sessionUser = this.getSessionUser();
            if (sessionUser) {
                console.log('✅ User found in session:', sessionUser.email);
                return sessionUser;
            }

            // Method 4: Temporary bypass for development
            if (this.isDevelopmentMode()) {
                console.log('⚠️ Development mode: Using temporary access');
                return this.getTempDevelopmentUser();
            }

            console.log('❌ No authenticated user found');
            return null;

        } catch (error) {
            console.error('❌ Error retrieving user:', error);
            throw error;
        }
    }

    /**
     * Verify user access against management registry
     */
    async verifyUserAccess(user) {
        console.log('🔐 Verifying user access...');
        
        const verification = {
            user: user,
            authorized: false,
            role: null,
            level: null,
            permissions: [],
            departments: [],
            verified: false,
            reason: '',
            timestamp: new Date().toISOString()
        };

        if (!user) {
            verification.reason = 'No authenticated user found';
            this.logAccess(verification, 'DENIED_NO_USER');
            return verification;
        }

        const email = user.email?.toLowerCase();
        const managementAccount = this.managementRegistry[email];

        if (!managementAccount) {
            verification.reason = `Email ${email} not found in management registry`;
            this.logAccess(verification, 'DENIED_NOT_AUTHORIZED');
            return verification;
        }

        if (!managementAccount.active) {
            verification.reason = `Management account for ${email} is deactivated`;
            this.logAccess(verification, 'DENIED_INACTIVE');
            return verification;
        }

        // Account found and active
        verification.authorized = true;
        verification.role = managementAccount.role;
        verification.level = managementAccount.level;
        verification.permissions = [...managementAccount.permissions];
        verification.departments = managementAccount.departments || [];
        verification.verified = managementAccount.verified;
        verification.reason = 'Access authorized';

        console.log('✅ User verified:', {
            email: email,
            role: verification.role,
            level: verification.level
        });

        this.logAccess(verification, 'AUTHORIZED');
        return verification;
    }

    /**
     * Check specific permissions for dashboard functions
     */
    checkPermissions(verification) {
        console.log('🔑 Checking dashboard permissions...');
        
        const permissions = {
            valid: false,
            canView: false,
            canEdit: false,
            canDelete: false,
            canManageUsers: false,
            canConfigSystem: false,
            allowedDepartments: [],
            restrictions: []
        };

        if (!verification.authorized) {
            permissions.restrictions.push('User not authorized');
            return permissions;
        }

        // Check basic permissions
        permissions.canView = verification.permissions.includes('view');
        permissions.canEdit = verification.permissions.includes('edit');
        permissions.canDelete = verification.permissions.includes('delete');
        permissions.canManageUsers = verification.permissions.includes('manage_users');
        permissions.canConfigSystem = verification.permissions.includes('system_config');
        permissions.allowedDepartments = verification.departments || [];

        // Verify account status
        if (!verification.verified && this.security.requireVerification) {
            permissions.restrictions.push('Account requires verification');
        }

        // Check if user has minimum required permissions
        if (!permissions.canView) {
            permissions.restrictions.push('No view permissions');
        }

        // Determine overall validity
        permissions.valid = permissions.canView && permissions.restrictions.length === 0;

        console.log('📊 Permissions summary:', {
            valid: permissions.valid,
            canView: permissions.canView,
            canEdit: permissions.canEdit,
            restrictions: permissions.restrictions
        });

        return permissions;
    }

    /**
     * Grant access to the Leadership Portal
     */
    async grantPortalAccess(verification, permissions) {
        console.log('🎉 Granting portal access...');
        
        try {
            // Initialize dashboard with user context
            await this.initializeDashboard(verification, permissions);
            
            // Set user session
            this.setUserSession(verification);
            
            // Show success message
            this.showAccessGranted(verification);
            
            // Enable dashboard functionality
            this.enableDashboardFeatures(permissions);
            
            // Log successful access
            this.logAccess(verification, 'ACCESS_GRANTED');
            
            console.log('✅ Portal access granted successfully');
            
        } catch (error) {
            console.error('❌ Error granting access:', error);
            throw error;
        }
    }

    /**
     * Deny access to the Leadership Portal
     */
    async denyPortalAccess(verification, permissions) {
        console.log('🚫 Denying portal access...');
        
        try {
            // Show access denied message
            this.showAccessDenied(verification, permissions);
            
            // Log denied access
            this.logAccess(verification, 'ACCESS_DENIED');
            
            // Redirect based on reason
            if (!verification.user) {
                await this.redirectToLogin();
            } else {
                await this.showUnauthorizedPage();
            }
            
        } catch (error) {
            console.error('❌ Error handling access denial:', error);
        }
    }

    /**
     * Generate detailed access report for all management emails
     */
    generateAccessReport() {
        console.log('📊 Generating access verification report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            totalAccounts: Object.keys(this.managementRegistry).length,
            activeAccounts: 0,
            verifiedAccounts: 0,
            unverifiedAccounts: 0,
            inactiveAccounts: 0,
            accounts: [],
            recommendations: [],
            securityStatus: 'UNKNOWN'
        };

        // Analyze each account
        Object.entries(this.managementRegistry).forEach(([email, account]) => {
            const accountStatus = {
                email: email,
                role: account.role,
                level: account.level,
                active: account.active,
                verified: account.verified,
                permissions: account.permissions,
                departments: account.departments || [],
                status: 'UNKNOWN',
                issues: [],
                recommendations: []
            };

            // Determine account status
            if (!account.active) {
                accountStatus.status = 'INACTIVE';
                accountStatus.issues.push('Account is deactivated');
                accountStatus.recommendations.push('Activate account if user should have access');
                report.inactiveAccounts++;
            } else if (!account.verified && this.security.requireVerification) {
                accountStatus.status = 'REQUIRES_VERIFICATION';
                accountStatus.issues.push('Account requires email verification');
                accountStatus.recommendations.push('Send verification email or manually verify');
                report.unverifiedAccounts++;
            } else {
                accountStatus.status = 'ACTIVE';
                report.verifiedAccounts++;
            }

            if (account.active) {
                report.activeAccounts++;
            }

            // Check for permission issues
            if (!account.permissions.includes('view')) {
                accountStatus.issues.push('Missing basic view permissions');
                accountStatus.recommendations.push('Add view permission');
            }

            report.accounts.push(accountStatus);
        });

        // Overall security assessment
        if (report.verifiedAccounts === report.totalAccounts) {
            report.securityStatus = 'SECURE';
        } else if (report.unverifiedAccounts > 0) {
            report.securityStatus = 'REQUIRES_ATTENTION';
            report.recommendations.push(`${report.unverifiedAccounts} accounts require verification`);
        }

        if (report.inactiveAccounts > report.activeAccounts * 0.5) {
            report.recommendations.push('High number of inactive accounts - review and clean up');
        }

        console.log('📋 Access report generated:', report);
        return report;
    }

    /**
     * Automatically fix common access issues
     */
    async autoFixAccessIssues() {
        console.log('🔧 Auto-fixing access issues...');
        
        const fixes = {
            applied: [],
            failed: [],
            skipped: []
        };

        try {
            // Fix 1: Auto-verify core leadership emails
            const coreEmails = ['teamzornhq@gmail.com', 'leader@zorn.team'];
            coreEmails.forEach(email => {
                if (this.managementRegistry[email] && !this.managementRegistry[email].verified) {
                    this.managementRegistry[email].verified = true;
                    fixes.applied.push(`Auto-verified core email: ${email}`);
                }
            });

            // Fix 2: Ensure minimum permissions
            Object.entries(this.managementRegistry).forEach(([email, account]) => {
                if (account.active && !account.permissions.includes('view')) {
                    account.permissions.push('view');
                    fixes.applied.push(`Added view permission to: ${email}`);
                }
            });

            // Fix 3: Save changes to storage
            this.saveManagementRegistry();

            console.log('✅ Auto-fix completed:', fixes);
            return fixes;

        } catch (error) {
            console.error('❌ Auto-fix failed:', error);
            fixes.failed.push(`Auto-fix error: ${error.message}`);
            return fixes;
        }
    }

    /**
     * Development mode utilities
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('dev=true');
    }

    getTempDevelopmentUser() {
        return {
            email: 'teamzornhq@gmail.com',
            name: 'Development Admin',
            temp: true,
            loginTime: Date.now()
        };
    }

    /**
     * UI Management Functions
     */
    showVerificationScreen() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.style.display = 'flex';
            screen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3>🔐 Verifying Access</h3>
                    <p>Checking leadership credentials...</p>
                </div>
            `;
        }
    }

    hideVerificationScreen() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.style.display = 'none';
        }
    }

    /**
     * Initialize dashboard with user context and permissions
     */
    async initializeDashboard(verification, permissions) {
        console.log('🎛️ Initializing dashboard for user:', verification.email);
        
        try {
            // Check if we're on the dashboard page
            if (window.location.pathname.includes('dashboard') || 
                window.location.pathname.includes('access-verification')) {
                
                // Set up user context in dashboard
                if (typeof window.initializeDashboard === 'function') {
                    await window.initializeDashboard(verification, permissions);
                } else if (window.dashboardManager) {
                    await window.dashboardManager.initialize(verification, permissions);
                } else {
                    // Basic initialization - set user info in DOM
                    const userElements = document.querySelectorAll('.user-name, .user-role, .user-email');
                    userElements.forEach(el => {
                        if (el.classList.contains('user-name')) el.textContent = verification.role;
                        if (el.classList.contains('user-role')) el.textContent = verification.role;
                        if (el.classList.contains('user-email')) el.textContent = verification.email;
                    });
                }
                
                console.log('✅ Dashboard initialization completed');
            }
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
        }
    }

    /**
     * Set user session data
     */
    setUserSession(verification) {
        try {
            const sessionData = {
                email: verification.email,
                role: verification.role,
                level: verification.level,
                permissions: verification.permissions,
                loginTime: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };

            // Store in sessionStorage (cleared when tab closes)
            sessionStorage.setItem('leadership_session', JSON.stringify(sessionData));
            
            // Also store basic info in localStorage for persistence
            const persistentData = {
                email: verification.email,
                role: verification.role,
                lastLogin: sessionData.loginTime
            };
            localStorage.setItem('leadership_user', JSON.stringify(persistentData));
            
            console.log('✅ User session established:', verification.email);
        } catch (error) {
            console.error('❌ Failed to set user session:', error);
        }
    }

    /**
     * Enable dashboard features based on permissions
     */
    enableDashboardFeatures(permissions) {
        console.log('🔧 Enabling dashboard features:', permissions);
        
        try {
            // Enable/disable UI elements based on permissions
            const permissionMap = {
                'view': ['.view-only', '.read-access'],
                'edit': ['.edit-controls', '.modify-access'],
                'delete': ['.delete-controls', '.remove-access'],
                'system_config': ['.admin-controls', '.system-settings']
            };

            // Hide all restricted elements first
            document.querySelectorAll('[data-permission]').forEach(el => {
                el.style.display = 'none';
            });

            // Show elements user has permission for
            permissions.forEach(permission => {
                const selectors = permissionMap[permission] || [];
                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => el.style.display = '');
                });

                // Also show elements with matching data-permission
                document.querySelectorAll(`[data-permission="${permission}"]`).forEach(el => {
                    el.style.display = '';
                });
            });

            console.log('✅ Dashboard features enabled for permissions:', permissions);
        } catch (error) {
            console.error('❌ Failed to enable dashboard features:', error);
        }
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showAccessGranted(verification) {
        console.log(`🎉 Welcome ${verification.role}! Access granted to Leadership Portal.`);
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500); // Match transition time
        }
        
        // Show dashboard container
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) {
            dashboardContainer.style.display = 'block';
        }
        
        // Show welcome message
        this.showNotification(
            `Welcome ${verification.role}!`,
            'Portal access granted',
            'success'
        );
    }

    showAccessDenied(verification, permissions) {
        const reasons = [];
        
        if (!verification.authorized) {
            reasons.push(verification.reason);
        }
        
        if (permissions.restrictions.length > 0) {
            reasons.push(...permissions.restrictions);
        }

        console.log('🚫 Access denied:', reasons.join(', '));
        
        // Hide loading screen  
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        this.showNotification(
            'Access Denied',
            `Reason: ${reasons.join(', ')}`,
            'error'
        );
    }

    /**
     * Utility Functions
     */
    getStoredToken() {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }

    getSessionUser() {
        try {
            const user = localStorage.getItem('current_user') || sessionStorage.getItem('current_user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    logAccess(verification, action) {
        const log = {
            timestamp: new Date().toISOString(),
            action: action,
            email: verification.user?.email || 'unknown',
            role: verification.role,
            authorized: verification.authorized,
            reason: verification.reason,
            ip: this.getClientIP()
        };

        this.accessLogs.push(log);
        console.log('📝 Access logged:', log);

        // Save logs to storage
        this.saveAccessLogs();
    }

    saveAccessLogs() {
        try {
            localStorage.setItem('portal_access_logs', JSON.stringify(this.accessLogs));
        } catch (error) {
            console.error('Failed to save access logs:', error);
        }
    }

    loadAccessLogs() {
        try {
            const logs = localStorage.getItem('portal_access_logs');
            this.accessLogs = logs ? JSON.parse(logs) : [];
        } catch (error) {
            console.error('Failed to load access logs:', error);
            this.accessLogs = [];
        }
    }

    /**
     * Save management registry to localStorage
     */
    saveManagementRegistry() {
        try {
            localStorage.setItem('management_registry', JSON.stringify(this.managementRegistry));
            console.log('✅ Management registry saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save management registry:', error);
            throw error;
        }
    }

    /**
     * Load management registry from localStorage
     */
    loadManagementRegistry() {
        try {
            const saved = localStorage.getItem('management_registry');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults, keeping saved data priority
                Object.keys(parsed).forEach(email => {
                    this.managementRegistry[email] = {
                        ...this.managementRegistry[email],
                        ...parsed[email]
                    };
                });
                console.log('✅ Management registry loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to load management registry:', error);
        }
    }

    /**
     * Verify system integrity on startup
     */
    async verifySystemIntegrity() {
        console.log('🔍 Verifying system integrity...');
        
        try {
            // Load saved registry
            this.loadManagementRegistry();
            
            // Ensure core accounts exist
            const coreAccounts = ['teamzornhq@gmail.com', 'leader@zorn.team'];
            let systemHealthy = true;
            
            coreAccounts.forEach(email => {
                if (!this.managementRegistry[email]) {
                    console.error(`❌ Critical: Core account missing: ${email}`);
                    systemHealthy = false;
                } else if (!this.managementRegistry[email].active) {
                    console.warn(`⚠️ Warning: Core account inactive: ${email}`);
                }
            });
            
            if (systemHealthy) {
                console.log('✅ System integrity verified');
            } else {
                console.warn('⚠️ System integrity issues detected');
            }
            
        } catch (error) {
            console.error('❌ System integrity verification failed:', error);
        }
    }

    getClientIP() {
        // Note: This is limited in browser environment
        return 'client-ip-unavailable';
    }

    showNotification(title, message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        // You can implement a toast notification here
    }

    /**
     * Handle critical system errors during initialization
     */
    handleSystemError(error) {
        console.error('🚨 Critical system error:', error);
        
        // Log error for troubleshooting
        this.logAccess('system_error', 'system', {
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines only
            timestamp: new Date().toISOString()
        });

        // Attempt basic recovery
        try {
            // Ensure management registry has core accounts
            if (!this.managementRegistry['teamzornhq@gmail.com']) {
                this.managementRegistry['teamzornhq@gmail.com'] = {
                    role: 'Team Lead',
                    level: 'admin', 
                    permissions: ['view', 'edit', 'delete', 'system_config'],
                    departments: ['all'],
                    active: true,
                    verified: true
                };
            }
            
            if (!this.managementRegistry['leader@zorn.team']) {
                this.managementRegistry['leader@zorn.team'] = {
                    role: 'Leadership',
                    level: 'admin',
                    permissions: ['view', 'edit', 'delete', 'system_config'], 
                    departments: ['all'],
                    active: true,
                    verified: true
                };
            }

            // Save recovery state
            this.saveManagementRegistry();
            console.log('🔄 Basic system recovery completed');
            
        } catch (recoveryError) {
            console.error('❌ System recovery failed:', recoveryError);
        }
    }

    /**
     * Error handling
     */
    async handleAccessError(error) {
        console.error('🚨 Access system error:', error);
        
        // Show error page
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h2>🚨 Portal Access Error</h2>
                <p>There was an error verifying your access to the Leadership Portal.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px; cursor: pointer;">
                    Try Again
                </button>
                <button onclick="window.location.href='/login.html'" style="padding: 10px 20px; margin: 10px; cursor: pointer;">
                    Go to Login
                </button>
            </div>
        `;
    }
}

// Initialize the authentication system
window.leadershipAuth = new LeadershipPortalAuth();