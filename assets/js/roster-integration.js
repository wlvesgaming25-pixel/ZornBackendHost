// Dashboard to Roster Integration
// Automatically adds accepted applications to the roster page

class RosterIntegration {
    constructor() {
        this.storageKey = 'zornRosterMembers';
        this.init();
    }

    init() {
        // Listen for application acceptance events
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Custom event for when an application is accepted
        window.addEventListener('applicationAccepted', (event) => {
            this.addMemberToRoster(event.detail);
        });
    }

    /**
     * Add accepted applicant to roster
     * @param {Object} application - The accepted application data
     */
    async addMemberToRoster(application) {
        try {
            const member = this.transformApplicationToMember(application);
            
            // Get existing roster members
            const rosterMembers = this.getRosterMembers();
            
            // Check if member already exists
            const exists = rosterMembers.some(m => 
                m.email === member.email || m.discordTag === member.discordTag
            );
            
            if (!exists) {
                rosterMembers.push(member);
                this.saveRosterMembers(rosterMembers);
                
                console.log('✅ Member added to roster:', member.name);
                
                // Show success notification if on dashboard
                if (typeof window.dashboardManager !== 'undefined') {
                    window.dashboardManager.showNotification(
                        `${member.name} has been added to the roster!`,
                        'success'
                    );
                }
            }
            
            return member;
        } catch (error) {
            console.error('Error adding member to roster:', error);
            throw error;
        }
    }

    /**
     * Transform application data to roster member format
     * @param {Object} application - Application data
     * @returns {Object} Roster member object
     */
    transformApplicationToMember(application) {
        const position = this.normalizePosition(application.role || application.position);
        
        return {
            id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: application.name || application.fullName,
            position: position,
            country: application.country || this.getCountryFromApplication(application),
            countryFlag: this.getCountryFlag(application.country),
            socials: this.extractSocials(application),
            discordTag: application.discordTag || application.discord,
            email: application.email,
            joinedDate: new Date().toISOString(),
            status: 'active',
            addedFrom: 'dashboard',
            applicationId: application.id
        };
    }

    /**
     * Normalize position names to match roster categories
     * @param {string} role - Role/position from application
     * @returns {string} Normalized position
     */
    normalizePosition(role) {
        const roleMap = {
            'freestyler': 'Freestyler',
            'freestyle': 'Freestyler',
            'competitive': 'Competitive',
            'competitive-clip-hitter': 'Competitive',
            'content-creator': 'Content Creator',
            'creator': 'Content Creator',
            'editor': 'Editor',
            'video-editor': 'Editor',
            'designer': 'Designer',
            'graphic-designer': 'Designer',
            'management': 'Management',
            'moderator': 'Management',
            'coach': 'Coach',
            'other': 'Other'
        };
        
        const normalized = role.toLowerCase().replace(/\s+/g, '-');
        return roleMap[normalized] || role;
    }

    /**
     * Extract social media links from application
     * @param {Object} application - Application data
     * @returns {Object} Social media links
     */
    extractSocials(application) {
        const socials = {};
        
        // Common social media platforms
        const platforms = ['twitter', 'youtube', 'twitch', 'tiktok', 'instagram', 'discord'];
        
        platforms.forEach(platform => {
            const key = `${platform}Link`;
            const altKey = platform;
            const urlKey = `${platform}Url`;
            
            if (application[key]) {
                socials[platform] = application[key];
            } else if (application[altKey]) {
                socials[platform] = application[altKey];
            } else if (application[urlKey]) {
                socials[platform] = application[urlKey];
            }
        });
        
        // Add any portfolio links
        if (application.portfolioLink || application.portfolio) {
            socials.portfolio = application.portfolioLink || application.portfolio;
        }
        
        return socials;
    }

    /**
     * Get country flag emoji
     * @param {string} country - Country name or code
     * @returns {string} Flag emoji
     */
    getCountryFlag(country) {
        if (!country) return '🌍';
        
        const countryFlags = {
            'united states': '🇺🇸',
            'usa': '🇺🇸',
            'us': '🇺🇸',
            'united kingdom': '🇬🇧',
            'uk': '🇬🇧',
            'canada': '🇨🇦',
            'australia': '🇦🇺',
            'germany': '🇩🇪',
            'france': '🇫🇷',
            'spain': '🇪🇸',
            'italy': '🇮🇹',
            'netherlands': '🇳🇱',
            'belgium': '🇧🇪',
            'sweden': '🇸🇪',
            'norway': '🇳🇴',
            'denmark': '🇩🇰',
            'finland': '🇫🇮',
            'poland': '🇵🇱',
            'brazil': '🇧🇷',
            'mexico': '🇲🇽',
            'argentina': '🇦🇷',
            'japan': '🇯🇵',
            'south korea': '🇰🇷',
            'china': '🇨🇳',
            'india': '🇮🇳'
        };
        
        const normalized = country.toLowerCase();
        return countryFlags[normalized] || '🌍';
    }

    /**
     * Try to extract country from application data
     * @param {Object} application - Application data
     * @returns {string} Country name
     */
    getCountryFromApplication(application) {
        // Try various possible fields
        return application.country || 
               application.location || 
               application.region || 
               'Unknown';
    }

    /**
     * Get roster members from localStorage
     * @returns {Array} Array of roster members
     */
    getRosterMembers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading roster members:', error);
            return [];
        }
    }

    /**
     * Save roster members to localStorage
     * @param {Array} members - Array of roster members
     */
    saveRosterMembers(members) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(members));
            
            // Dispatch event for roster page to update
            window.dispatchEvent(new CustomEvent('rosterUpdated', {
                detail: { members }
            }));
        } catch (error) {
            console.error('Error saving roster members:', error);
            throw error;
        }
    }

    /**
     * Get members by position
     * @param {string} position - Position to filter by
     * @returns {Array} Members in that position
     */
    getMembersByPosition(position) {
        const members = this.getRosterMembers();
        return members.filter(m => m.position === position && m.status === 'active');
    }

    /**
     * Remove member from roster
     * @param {string} memberId - Member ID to remove
     */
    removeMember(memberId) {
        const members = this.getRosterMembers();
        const filtered = members.filter(m => m.id !== memberId);
        this.saveRosterMembers(filtered);
    }

    /**
     * Update member status
     * @param {string} memberId - Member ID
     * @param {string} status - New status
     */
    updateMemberStatus(memberId, status) {
        const members = this.getRosterMembers();
        const member = members.find(m => m.id === memberId);
        
        if (member) {
            member.status = status;
            this.saveRosterMembers(members);
        }
    }
}

// Initialize roster integration
window.rosterIntegration = new RosterIntegration();

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RosterIntegration;
}
