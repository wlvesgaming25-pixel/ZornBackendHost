/**
 * Team Zorn Dashboard Application Management System
 * Handles application loading, filtering, sorting, and approval workflow
 */

class DashboardManager {
    constructor() {
        // Access control
        this.config = new ProductionConfig();
        this.authorizedEmails = [
            'ticklemybootey@gmail.com',
            'zacfrew06@gmail.com'
        ];
        this.currentUser = null;
        
        // Dashboard data
        this.applications = [];
        this.filteredApplications = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.selectedApplication = null;
        this.isLoading = false;
        this.pollInterval = null;
        this.lastUpdateTime = null;
        
        // Initialize access control
        this.checkAccess();
        
        // Mock data for demonstration - can be cleared
        this.mockApplications = [
            {
                id: 'demo_001',
                name: 'Alex Chen',
                email: 'alex.chen@email.com',
                discordTag: 'AlexChen#2847',
                role: 'Creative Designer',
                status: 'pending',
                submittedAt: new Date('2025-10-20T14:30:00Z'),
                message: 'I\'ve been creating content for 3+ years and specialize in motion graphics and brand design. I love the aesthetic of Team Zorn and would love to contribute to your creative vision.',
                portfolio: 'https://alexchen.design',
                experience: '3+ years',
                availability: 'Part-time (15-20 hrs/week)',
                timezone: 'EST',
                software: ['After Effects', 'Photoshop', 'Illustrator', 'Figma'],
                previousWork: 'Freelance designer for various esports organizations',
                whyZorn: 'I admire Team Zorn\'s innovative approach to content creation and community building.',
                isDemo: true // Mark as demo data
            },
            {
                id: 'demo_002',
                name: 'Jordan Martinez',
                email: 'jordan.m.gaming@email.com',
                discordTag: 'JordanM#9456',
                role: 'Competitive Player',
                status: 'pending',
                submittedAt: new Date('2025-10-19T09:15:00Z'),
                message: 'Radiant Valorant player with tournament experience. Currently looking for a competitive team to join for upcoming VCT events.',
                rank: 'Radiant (Peak)',
                mainAgent: 'Jett, Reyna',
                hoursPlayed: '2000+',
                tournamentExperience: 'Local tournaments, ranked #1 in regional ladder',
                availability: 'Full-time',
                teamExperience: 'Previously played for collegiate team',
                streaming: 'Yes, 500+ followers on Twitch',
                isDemo: true // Mark as demo data
            },
            {
                id: 'demo_003',
                name: 'Morgan Taylor',
                email: 'morgan.taylor.content@email.com',
                discordTag: 'MorganT#3721',
                role: 'Content Creator',
                status: 'accepted',
                submittedAt: new Date('2025-10-18T16:45:00Z'),
                message: 'TikTok creator with 50K+ followers specializing in gaming content and tutorials. Would love to create content for Team Zorn.',
                contentStyle: 'Gaming tutorials, funny moments, reaction videos',
                postingFrequency: 'Daily on TikTok, 3x/week on YouTube',
                equipment: 'Professional streaming setup with OBS, good microphone',
                collaborations: 'Worked with several gaming brands',
                isDemo: true // Mark as demo data
            },
            {
                id: 'demo_004',
                name: 'Sam Rivera',
                email: 'sam.rivera.mgmt@email.com',
                discordTag: 'SamRivera#8152',
                role: 'Team Management',
                status: 'denied',
                submittedAt: new Date('2025-10-17T11:20:00Z'),
                message: 'Experienced in esports team management with background in business operations and team coordination.',
                experience: '2 years managing regional esports team',
                skills: ['Team coordination', 'Scheduling', 'Sponsor relations', 'Event planning'],
                availability: 'Full-time',
                previousTeams: 'Regional Legends (Valorant team)',
                achievements: 'Led team to 3 tournament victories',
                isDemo: true // Mark as demo data
            },
            {
                id: 'demo_005',
                name: 'Casey Wong',
                email: 'casey.w.editor@email.com',
                role: 'Video Editor',
                status: 'pending',
                submittedAt: new Date('2025-10-16T13:10:00Z'),
                message: 'Professional video editor with 4+ years experience in gaming content. Specialized in highlight reels and promotional videos.',
                software: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
                experience: '4+ years',
                portfolio: 'casywong.video',
                style: 'Fast-paced highlights, cinematic montages',
                turnaround: '24-48 hours for most projects',
                availability: 'Part-time (20-25 hrs/week)',
                isDemo: true // Mark as demo data
            }
        ];
    }

    /**
     * Check if user has access to dashboard
     */
    async checkAccess() {
        console.log('🔒 Checking dashboard access...');
        
        try {
            // Load authenticated user
            await this.loadAuthenticatedUser();
            
            // Verify access permissions
            if (this.hasAccess()) {
                console.log('✅ Access granted - initializing dashboard');
                await this.init();
            } else {
                console.log('❌ Access denied - redirecting');
                this.redirectToAccessDenied();
            }
        } catch (error) {
            console.error('Access verification failed:', error);
            this.redirectToAccessDenied();
        }
    }

    async loadAuthenticatedUser() {
        // Try OAuth JWT first
        const oauthUser = await this.loadOAuthUser();
        if (oauthUser) {
            this.currentUser = oauthUser;
            return;
        }

        // Fallback to local session
        const localUser = this.loadLocalUser();
        if (localUser) {
            this.currentUser = localUser;
            return;
        }

        throw new Error('No authenticated user found');
    }

    async loadOAuthUser() {
        try {
            const response = await fetch(`${this.config.getOAuthUrl()}/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ OAuth user loaded:', userData.email);
                return userData;
            }
        } catch (error) {
            console.log('No OAuth session found');
        }
        return null;
    }

    loadLocalUser() {
        const session = localStorage.getItem('zorn_user_session');
        if (session) {
            try {
                const user = JSON.parse(session);
                if (this.isSessionValid(user)) {
                    console.log('✅ Local user session loaded:', user.email);
                    return user;
                }
            } catch (e) {
                console.error('Invalid local session data');
            }
        }
        return null;
    }

    isSessionValid(user) {
        if (!user.loginTime) return false;
        const sessionAge = Date.now() - user.loginTime;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        return sessionAge < maxAge;
    }

    hasAccess() {
        if (!this.currentUser || !this.currentUser.email) {
            return false;
        }
        return this.authorizedEmails.includes(this.currentUser.email.toLowerCase());
    }

    redirectToAccessDenied() {
        window.location.href = '/access-restricted';
    }

    /**
     * Initialize dashboard functionality
     */
    async init() {
        console.log('🎮 Initializing Team Zorn Dashboard...');
        
        try {
            await this.loadApplications();
            this.setupEventListeners();
            this.renderApplications();
            this.updateStats();
            this.initializeAnimations();
            this.startRealTimeUpdates();
            
            console.log('✅ Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    /**
     * Load applications from API or mock data
     */
    async loadApplications() {
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Try to load from localStorage first (persistent storage)
            const savedApplications = localStorage.getItem('zorn_applications');
            console.log('🔍 Raw localStorage content:', savedApplications);
            
            if (savedApplications) {
                const parsed = JSON.parse(savedApplications);
                this.applications = parsed;
                console.log('📂 Loaded applications from localStorage:', this.applications.length);
                
                // Debug: Log each application
                parsed.forEach((app, index) => {
                    console.log(`  ${index + 1}. ${app.name} (${app.role}) - ${app.isDemo ? 'DEMO' : 'REAL'} - ID: ${app.id}`);
                });
            } else {
                // First time loading - use demo data
                this.applications = [...this.mockApplications];
                this.saveApplicationsToStorage();
                console.log('🎭 Loaded demo applications:', this.applications.length);
            }

            // Try to fetch new applications from API
            await this.fetchNewApplications();
            
            this.filteredApplications = [...this.applications];
            this.lastUpdateTime = new Date();
            
        } catch (error) {
            console.error('Error loading applications:', error);
            // Fallback to demo data if everything fails
            if (this.applications.length === 0) {
                this.applications = [...this.mockApplications];
                this.filteredApplications = [...this.applications];
            }
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    /**
     * Fetch new applications from the API
     */
    async fetchNewApplications() {
        try {
            // In production, this would connect to your application submission API
            // For now, we'll simulate checking for new applications
            const response = await fetch('/api/applications/new', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const newApplications = await response.json();
                if (newApplications && newApplications.length > 0) {
                    this.addNewApplications(newApplications);
                }
            }
        } catch (error) {
            // API not available yet - this is expected during development
            console.log('📡 API not available - using local storage only');
        }
    }

    /**
     * Add new applications and notify user
     */
    addNewApplications(newApplications) {
        const addedCount = 0;
        
        newApplications.forEach(newApp => {
            // Check if application already exists
            const exists = this.applications.some(app => app.id === newApp.id);
            if (!exists) {
                // Add timestamp if not present
                if (!newApp.submittedAt) {
                    newApp.submittedAt = new Date();
                }
                newApp.status = newApp.status || 'pending';
                
                this.applications.unshift(newApp); // Add to beginning
                addedCount++;
            }
        });

        if (addedCount > 0) {
            this.saveApplicationsToStorage();
            this.applyFilters();
            this.renderApplications();
            this.showNotification(`${addedCount} new application(s) received!`, 'success');
            
            // Flash the new applications
            this.highlightNewApplications(newApplications.map(app => app.id));
        }
    }

    /**
     * Save applications to localStorage
     */
    saveApplicationsToStorage() {
        try {
            localStorage.setItem('zorn_applications', JSON.stringify(this.applications));
        } catch (error) {
            console.error('Failed to save applications to storage:', error);
        }
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }

        // Modal events
        const modalClose = document.getElementById('modalClose');
        const applicationModal = document.getElementById('applicationModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (applicationModal) {
            applicationModal.addEventListener('click', (e) => {
                if (e.target === applicationModal) {
                    this.closeModal();
                }
            });
        }

        // Application action buttons
        const acceptBtn = document.getElementById('acceptApplicationBtn');
        const denyBtn = document.getElementById('denyApplicationBtn');
        const removeBtn = document.getElementById('removeApplicationBtn');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.handleApplicationAction('accept');
            });
        }

        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                this.handleApplicationAction('deny');
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.handleApplicationAction('remove');
            });
        }

        // Confirmation modal
        const confirmationCancel = document.getElementById('confirmationCancel');
        const confirmationConfirm = document.getElementById('confirmationConfirm');
        const confirmationModal = document.getElementById('confirmationModal');

        if (confirmationCancel) {
            confirmationCancel.addEventListener('click', () => {
                this.hideConfirmationModal();
            });
        }

        if (confirmationConfirm) {
            confirmationConfirm.addEventListener('click', () => {
                this.executeConfirmedAction();
            });
        }

        if (confirmationModal) {
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    this.hideConfirmationModal();
                }
            });
        }

        // User profile dropdown
        const userProfile = document.getElementById('userProfileHeader');
        const userDropdown = document.getElementById('userDropdown');

        if (userProfile) {
            userProfile.addEventListener('click', () => {
                userProfile.classList.toggle('active');
                userDropdown.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (userProfile && userDropdown && 
                !userProfile.contains(e.target) && 
                !userDropdown.contains(e.target)) {
                userProfile.classList.remove('active');
                userDropdown.classList.remove('show');
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Clear demo data button
        const clearDemoBtn = document.getElementById('clearDemoBtn');
        if (clearDemoBtn) {
            clearDemoBtn.addEventListener('click', () => {
                this.handleClearDemoData();
            });
        }

        // Manual refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleManualRefresh();
            });
        }
    }

    /**
     * Handle filter changes
     */
    handleFilterChange(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.applyFilters();
        this.renderApplications();
    }

    /**
     * Handle sort changes
     */
    handleSortChange(sortType) {
        this.currentSort = sortType;
        this.applySorting();
        this.renderApplications();
    }

    /**
     * Apply current filters to applications
     */
    applyFilters() {
        if (this.currentFilter === 'all') {
            this.filteredApplications = [...this.applications];
        } else {
            this.filteredApplications = this.applications.filter(app => 
                app.status === this.currentFilter
            );
        }
        
        this.applySorting();
    }

    /**
     * Apply current sorting to filtered applications
     */
    applySorting() {
        switch (this.currentSort) {
            case 'newest':
                this.filteredApplications.sort((a, b) => 
                    new Date(b.submittedAt) - new Date(a.submittedAt)
                );
                break;
            case 'oldest':
                this.filteredApplications.sort((a, b) => 
                    new Date(a.submittedAt) - new Date(b.submittedAt)
                );
                break;
            case 'role':
                this.filteredApplications.sort((a, b) => 
                    a.role.localeCompare(b.role)
                );
                break;
            case 'name':
                this.filteredApplications.sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                break;
        }
    }

    /**
     * Render applications grid
     */
    renderApplications() {
        const grid = document.getElementById('applicationsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;

        if (this.filteredApplications.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.innerHTML = '';

        this.filteredApplications.forEach((application, index) => {
            const card = this.createApplicationCard(application, index);
            grid.appendChild(card);
        });

        this.updateStats();
    }

    /**
     * Create application card element
     */
    createApplicationCard(application, index) {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const statusClass = `status-${application.status}`;
        const timeAgo = this.formatTimeAgo(application.submittedAt);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="applicant-info">
                    <h3>${application.name}</h3>
                    <p class="applicant-email">${application.email}</p>
                </div>
                <div class="application-status ${statusClass}">
                    ${application.status}
                </div>
            </div>
            
            <div class="application-role">${application.role}</div>
            
            <div class="application-preview">
                ${application.message}
            </div>
            
            <div class="application-meta">
                <span class="meta-item">📅 ${timeAgo}</span>
            </div>
            
            <div class="card-actions">
                <button class="finalize-btn" data-app-id="${application.id}">
                    <span class="btn-text">Finalize</span>
                </button>
            </div>
        `;

        // Add finalize button event listener
        const finalizeBtn = card.querySelector('.finalize-btn');
        finalizeBtn.addEventListener('click', () => {
            this.handleFinalize(application.id);
        });

        return card;
    }

    /**
     * Handle finalize button click
     */
    async handleFinalize(applicationId) {
        const btn = document.querySelector(`[data-app-id="${applicationId}"]`);
        const btnText = btn.querySelector('.btn-text');
        
        // Show loading state
        btn.classList.add('loading');
        btnText.textContent = 'Finalizing...';
        btn.disabled = true;

        // Simulate processing delay
        await this.delay(1000);

        // Find and show application
        const application = this.applications.find(app => app.id === applicationId);
        if (application) {
            this.showApplicationModal(application);
        }

        // Reset button state
        btn.classList.remove('loading');
        btnText.textContent = 'Finalize';
        btn.disabled = false;
    }

    /**
     * Show application modal with full details
     */
    showApplicationModal(application) {
        this.selectedApplication = application;
        const modal = document.getElementById('applicationModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;

        // Populate modal content
        modalContent.innerHTML = this.generateModalContent(application);
        
        // Show modal with animation
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Generate modal content HTML
     */
    generateModalContent(application) {
        const timeAgo = this.formatTimeAgo(application.submittedAt);
        
        let content = `
            <div class="modal-field">
                <label>Applicant</label>
                <div class="modal-field-value">${application.name}</div>
            </div>
            
            <div class="modal-field">
                <label>Email</label>
                <div class="modal-field-value">${application.email}</div>
            </div>
            
            ${application.discordTag ? `
            <div class="modal-field">
                <label>Discord Tag</label>
                <div class="modal-field-value">${application.discordTag}</div>
            </div>
            ` : ''}
            
            <div class="modal-field">
                <label>Role Applied For</label>
                <div class="modal-field-value">${application.role}</div>
            </div>
            
            <div class="modal-field">
                <label>Submitted</label>
                <div class="modal-field-value">${timeAgo}</div>
            </div>
            
            <div class="modal-field">
                <label>Application Message</label>
                <div class="modal-field-value">${application.message}</div>
            </div>
        `;

        // Add role-specific fields
        if (application.portfolio) {
            content += `
                <div class="modal-field">
                    <label>Portfolio</label>
                    <div class="modal-field-value">
                        <a href="${application.portfolio}" target="_blank" style="color: #ff4824;">${application.portfolio}</a>
                    </div>
                </div>
            `;
        }

        if (application.software) {
            content += `
                <div class="modal-field">
                    <label>Software/Skills</label>
                    <div class="modal-field-value">${application.software.join(', ')}</div>
                </div>
            `;
        }

        if (application.rank) {
            content += `
                <div class="modal-field">
                    <label>Rank</label>
                    <div class="modal-field-value">${application.rank}</div>
                </div>
            `;
        }

        if (application.availability) {
            content += `
                <div class="modal-field">
                    <label>Availability</label>
                    <div class="modal-field-value">${application.availability}</div>
                </div>
            `;
        }

        return content;
    }

    /**
     * Close application modal
     */
    closeModal() {
        const modal = document.getElementById('applicationModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            this.selectedApplication = null;
        }
    }

    /**
     * Handle application actions (accept, deny, remove)
     */
    handleApplicationAction(action) {
        if (!this.selectedApplication) return;

        const messages = {
            accept: {
                title: 'Accept Application',
                message: `Are you sure you want to accept ${this.selectedApplication.name}'s application for ${this.selectedApplication.role}?`,
                confirmText: 'Accept'
            },
            deny: {
                title: 'Deny Application',
                message: `Are you sure you want to deny ${this.selectedApplication.name}'s application for ${this.selectedApplication.role}?`,
                confirmText: 'Deny'
            },
            remove: {
                title: 'Remove Application',
                message: `Are you sure you want to permanently remove ${this.selectedApplication.name}'s application? This action cannot be undone.`,
                confirmText: 'Remove'
            }
        };

        this.showConfirmationModal(action, messages[action]);
    }

    /**
     * Show confirmation modal
     */
    showConfirmationModal(action, config) {
        this.pendingAction = action;
        
        const modal = document.getElementById('confirmationModal');
        const title = document.getElementById('confirmationTitle');
        const message = document.getElementById('confirmationMessage');
        const confirmBtn = document.getElementById('confirmationConfirm');
        
        if (modal && title && message && confirmBtn) {
            title.textContent = config.title;
            message.textContent = config.message;
            confirmBtn.textContent = config.confirmText;
            
            modal.classList.add('show');
        }
    }

    /**
     * Hide confirmation modal
     */
    hideConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.remove('show');
            this.pendingAction = null;
        }
    }

    /**
     * Execute confirmed action
     */
    async executeConfirmedAction() {
        if (!this.pendingAction) return;

        const action = this.pendingAction;
        
        this.hideConfirmationModal();
        
        try {
            if (action === 'clearDemo') {
                this.clearDemoApplications();
                return;
            }

            // Handle application actions
            if (!this.selectedApplication) return;
            const application = this.selectedApplication;

            // In production, make API call here
            // await fetch(`/api/applications/${application.id}`, {
            //     method: 'PATCH',
            //     body: JSON.stringify({ action })
            // });

            // For demo, update local data
            if (action === 'remove') {
                this.applications = this.applications.filter(app => app.id !== application.id);
            } else {
                const appIndex = this.applications.findIndex(app => app.id === application.id);
                if (appIndex !== -1) {
                    this.applications[appIndex].status = action === 'accept' ? 'accepted' : 'denied';
                }
            }

            // Save changes
            this.saveApplicationsToStorage();

            this.closeModal();
            this.applyFilters();
            this.renderApplications();
            
            this.showNotification(`Application ${action}ed successfully!`, 'success');
            
        } catch (error) {
            console.error(`Error ${action}ing application:`, error);
            this.showNotification(`Failed to ${action} application`, 'error');
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const totalElement = document.getElementById('totalApplications');
        const pendingElement = document.getElementById('pendingApplications');
        const acceptedElement = document.getElementById('acceptedApplications');
        const deniedElement = document.getElementById('deniedApplications');

        const stats = this.applications.reduce((acc, app) => {
            acc.total++;
            acc[app.status]++;
            return acc;
        }, { total: 0, pending: 0, accepted: 0, denied: 0 });

        if (totalElement) totalElement.textContent = stats.total;
        if (pendingElement) pendingElement.textContent = stats.pending;
        if (acceptedElement) acceptedElement.textContent = stats.accepted;
        if (deniedElement) deniedElement.textContent = stats.denied;
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const grid = document.getElementById('applicationsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="loading-skeleton">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        // Loading state will be replaced by renderApplications()
    }

    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Add staggered animation to controls
        const controls = document.querySelectorAll('.dashboard-controls > *');
        controls.forEach((control, index) => {
            control.style.opacity = '0';
            control.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                control.style.transition = 'all 0.5s ease';
                control.style.opacity = '1';
                control.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        // Stop real-time updates
        this.stopRealTimeUpdates();
        
        // Clear user session
        localStorage.removeItem('currentUser');
        
        // Clear cookies
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    /**
     * Start real-time updates for new applications
     */
    startRealTimeUpdates() {
        console.log('🔄 Starting real-time application updates...');
        
        // Listen for localStorage changes (new applications from any source)
        window.addEventListener('storage', (e) => {
            console.log('📡 Storage event detected:', e.key, e.newValue);
            
            if (e.key === 'zorn_dashboard_notification') {
                this.handleNewApplicationNotification(e.newValue);
            } else if (e.key === 'zorn_applications') {
                // Applications list was updated, reload immediately
                console.log('📋 Applications updated, reloading...');
                this.loadApplicationsFromStorage();
            } else if (e.key === 'zorn_dashboard_update') {
                // Force check for new applications
                console.log('🔄 Dashboard update triggered, checking for new applications...');
                setTimeout(() => {
                    this.checkForNewApplications();
                }, 100);
            }
        });

        // Listen for custom events (same-tab notifications)
        window.addEventListener('zorn_new_application', (e) => {
            console.log('📨 Custom application event:', e.detail);
            this.handleNewApplicationFromEvent(e.detail);
        });

        // Poll for changes every 5 seconds (more frequent)
        this.pollInterval = setInterval(() => {
            this.checkForNewApplications();
        }, 5000);

        // Check immediately on window focus
        window.addEventListener('focus', () => {
            console.log('👁️ Window focused, checking for new applications...');
            this.checkForNewApplications();
        });

        // Initial check
        this.checkForNewApplications();
    }

    /**
     * Handle new application notification from localStorage
     */
    handleNewApplicationNotification(notificationData) {
        if (!notificationData) return;
        
        try {
            const notification = JSON.parse(notificationData);
            if (notification.type === 'new_application' && notification.application) {
                console.log('📨 Received new application notification:', notification.application.name);
                
                // Check if this application already exists
                const exists = this.applications.some(app => app.id === notification.application.id);
                if (!exists) {
                    // Add the new application
                    this.applications.unshift(notification.application);
                    this.applyFilters();
                    this.renderApplications();
                    
                    // Show notification
                    this.showNotification(`New application from ${notification.application.name}!`, 'success');
                    
                    // Highlight the new application
                    this.highlightNewApplications([notification.application.id]);
                }
            }
        } catch (error) {
            console.error('Error handling application notification:', error);
        }
    }

    /**
     * Load applications from localStorage (for real-time updates)
     */
    loadApplicationsFromStorage() {
        try {
            const stored = localStorage.getItem('zorn_applications');
            if (stored) {
                const storedApps = JSON.parse(stored);
                const currentIds = this.applications.map(app => app.id);
                const newApps = storedApps.filter(app => !currentIds.includes(app.id));
                
                if (newApps.length > 0) {
                    // Add new applications
                    this.applications = [...newApps, ...this.applications];
                    this.applyFilters();
                    this.renderApplications();
                    
                    console.log(`📥 Loaded ${newApps.length} new applications from storage`);
                }
            }
        } catch (error) {
            console.error('Error loading applications from storage:', error);
        }
    }

    /**
     * Check for new applications in localStorage
     */
    checkForNewApplications() {
        try {
            const stored = localStorage.getItem('zorn_applications');
            if (!stored) return;

            const storedApps = JSON.parse(stored);
            const currentIds = this.applications.map(app => app.id);
            const newApps = storedApps.filter(app => !currentIds.includes(app.id));

            if (newApps.length > 0) {
                console.log(`🆕 Found ${newApps.length} new applications!`);
                
                // Add new applications to the beginning
                newApps.forEach(newApp => {
                    this.applications.unshift(newApp);
                });

                // Update display
                this.applyFilters();
                this.renderApplications();
                
                // Show notification for each new application
                newApps.forEach(app => {
                    this.showNotification(`New application from ${app.name} for ${app.role}!`, 'success');
                });

                // Highlight new applications
                setTimeout(() => {
                    this.highlightNewApplications(newApps.map(app => app.id));
                }, 500);
            }
        } catch (error) {
            console.error('Error checking for new applications:', error);
        }
    }

    /**
     * Handle new application from custom event (same tab)
     */
    handleNewApplicationFromEvent(applicationData) {
        if (!applicationData) return;
        
        try {
            console.log('🎯 Handling new application from event:', applicationData.name);
            
            // Check if this application already exists
            const exists = this.applications.some(app => app.id === applicationData.id);
            if (!exists) {
                // Add the new application
                this.applications.unshift(applicationData);
                this.applyFilters();
                this.renderApplications();
                
                // Show notification
                this.showNotification(`New application from ${applicationData.name}!`, 'success');
                
                // Highlight the new application
                setTimeout(() => {
                    this.highlightNewApplications([applicationData.id]);
                }, 500);
            }
        } catch (error) {
            console.error('Error handling application from event:', error);
        }
    }

    /**
     * Stop real-time updates
     */
    stopRealTimeUpdates() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('⏹️ Stopped real-time updates');
        }
    }

    /**
     * Highlight new applications with animation
     */
    highlightNewApplications(applicationIds) {
        setTimeout(() => {
            applicationIds.forEach(id => {
                const card = document.querySelector(`[data-app-id="${id}"]`)?.closest('.application-card');
                if (card) {
                    card.classList.add('new-application');
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        card.classList.remove('new-application');
                    }, 3000);
                }
            });
        }, 500);
    }

    /**
     * Handle clearing demo data
     */
    handleClearDemoData() {
        const demoCount = this.applications.filter(app => app.isDemo).length;
        
        if (demoCount === 0) {
            this.showNotification('No demo applications to clear', 'info');
            return;
        }

        this.showConfirmationModal('clearDemo', {
            title: 'Clear Demo Applications',
            message: `Are you sure you want to remove all ${demoCount} demo/example applications? This will leave only real submitted applications. This action cannot be undone.`,
            confirmText: 'Clear Demo Data'
        });
    }

    /**
     * Execute demo data clearing
     */
    clearDemoApplications() {
        const beforeCount = this.applications.length;
        
        // Remove all applications marked as demo
        this.applications = this.applications.filter(app => !app.isDemo);
        
        const removedCount = beforeCount - this.applications.length;
        
        // Save to storage
        this.saveApplicationsToStorage();
        
        // Update display
        this.applyFilters();
        this.renderApplications();
        
        this.showNotification(`Cleared ${removedCount} demo applications. Only real submissions remain.`, 'success');
        
        console.log(`🗑️ Removed ${removedCount} demo applications`);
    }

    /**
     * Handle manual refresh
     */
    handleManualRefresh() {
        console.log('🔄 Manual refresh triggered');
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            // Add clicked animation class
            refreshBtn.classList.add('clicked');
            
            // Remove clicked class after animation
            setTimeout(() => {
                refreshBtn.classList.remove('clicked');
            }, 600);
            
            // Show loading state
            refreshBtn.disabled = true;
            refreshBtn.classList.add('loading');
        }

        // Check for new applications
        this.checkForNewApplications();

        // Reset button after delay
        setTimeout(() => {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.classList.remove('loading');
            }
            
            this.showNotification('Applications refreshed!', 'info');
        }, 1200);
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto hide after 3 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 3000);

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Format time ago string
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else {
            return `${diffDays} days ago`;
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global initialization function with access control
window.initializeDashboard = function() {
    if (!window.dashboardManager) {
        window.dashboardManager = new DashboardManager();
        // Access control is handled in constructor - no manual init() call
    }
};

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeDashboard);
} else {
    window.initializeDashboard();
}