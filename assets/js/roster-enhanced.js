// Enhanced Roster Manager with Dashboard Integration
class RosterManager {
    constructor() {
        this.storageKey = 'zornRosterMembers';
        this.init();
    }

    init() {
        this.loadAndDisplayMembers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for roster updates
        window.addEventListener('rosterUpdated', () => {
            this.loadAndDisplayMembers();
        });

        // Refresh button if exists
        const refreshBtn = document.getElementById('refreshRoster');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAndDisplayMembers();
            });
        }
    }

    /**
     * Load members from storage and display them
     */
    loadAndDisplayMembers() {
        try {
            const members = this.getStoredMembers();
            
            if (members.length > 0) {
                this.renderMembers(members);
            }
        } catch (error) {
            // Silently handle errors
        }
    }

    /**
     * Get members from localStorage
     * @returns {Array} Array of members
     */
    getStoredMembers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Render members to the roster page
     * @param {Array} members - Array of member objects
     */
    renderMembers(members) {
        // Group members by position
        const grouped = this.groupByPosition(members);
        
        // Render each position section
        Object.keys(grouped).forEach(position => {
            this.renderPositionSection(position, grouped[position]);
        });
    }

    /**
     * Group members by position
     * @param {Array} members - Array of members
     * @returns {Object} Members grouped by position
     */
    groupByPosition(members) {
        const activeMembers = members.filter(m => m.status === 'active');
        
        return activeMembers.reduce((groups, member) => {
            const position = member.position || 'Other';
            if (!groups[position]) {
                groups[position] = [];
            }
            groups[position].push(member);
            return groups;
        }, {});
    }

    /**
     * Render a position section
     * @param {string} position - Position name
     * @param {Array} members - Members in this position
     */
    renderPositionSection(position, members) {
        // Find the container for this position
        const container = this.getContainerIdForPosition(position);
        
        if (!container) {
            return;
        }

        // Clear existing dynamic members (keep any hardcoded ones)
        const dynamicMembers = container.querySelectorAll('[data-dynamic="true"]');
        dynamicMembers.forEach(el => el.remove());

        // Add new members
        members.forEach(member => {
            const memberCard = this.createMemberCard(member);
            container.appendChild(memberCard);
        });
    }

    /**
     * Get container ID for a position
     * @param {string} position - Position name
     * @returns {string} Container ID or class selector
     */
    getContainerIdForPosition(position) {
        // Map positions to their section containers
        const sectionMap = {
            'Freestyler': ['freestyler-section', 'roster-section'],
            'Competitive': ['competitive-section', 'roster-section'],
            'Content Creator': ['content-section', 'roster-section'],
            'Editor': ['editor-section', 'roster-section'],
            'Designer': ['designer-section', 'roster-section'],
            'Management': ['management-section', 'roster-section'],
            'Coach': ['coach-section', 'roster-section'],
            'Other': ['other-section', 'roster-section']
        };
        
        const sectionClasses = sectionMap[position];
        if (!sectionClasses) return null;
        
        // Try to find the section element with any of the possible classes
        let section = null;
        for (const className of sectionClasses) {
            section = document.querySelector(`.${className}`);
            if (section) break;
        }
        
        if (!section) {
            return null;
        }
        
        // Find the first member-grid within this section
        const grid = section.querySelector('.member-grid');
        return grid ? grid : null;
    }

    /**
     * Create a member card element
     * @param {Object} member - Member data
     * @returns {HTMLElement} Member card element
     */
    createMemberCard(member) {
        const card = document.createElement('div');
        card.className = 'member-card-new scroll-fade-in';
        card.setAttribute('data-dynamic', 'true');
        card.setAttribute('data-member-id', member.id);

        const socials = this.renderSocials(member.socials);

        card.innerHTML = `
            <div class="member-avatar">
                <div class="avatar-placeholder">${this.getInitials(member.name)}</div>
            </div>
            <div class="member-flag">
                <span style="font-size: 1.5rem;">${member.countryFlag || '🌍'}</span>
            </div>
            <div class="member-name-new">${this.escapeHtml(member.name)}</div>
            <div class="member-role-new">${this.escapeHtml(member.position)}</div>
            ${socials}
            <div class="new-member-badge">✨ New</div>
        `;

        return card;
    }

    /**
     * Render social media links
     * @param {Object} socials - Social media links
     * @returns {string} HTML for social links
     */
    renderSocials(socials) {
        if (!socials || Object.keys(socials).length === 0) {
            return '';
        }

        const socialIcons = {
            twitter: 'x-logo.png',
            youtube: 'yt-logo.png',
            twitch: 'twitch-logo.png',
            tiktok: 'tiktok-logo.png',
            instagram: 'instagram-logo.png',
            discord: 'discord-logo.png'
        };

        let socialLinks = '<div class="social-icons">';
        
        Object.keys(socials).forEach(platform => {
            if (socials[platform] && socialIcons[platform]) {
                const iconPath = `assets/img/roster/sociallogos/${socialIcons[platform]}`;
                socialLinks += `
                    <a href="${this.escapeHtml(socials[platform])}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="social-icon ${platform}">
                        <img src="${iconPath}" alt="${platform}">
                    </a>
                `;
            }
        });

        socialLinks += '</div>';
        return socialLinks;
    }

    /**
     * Get initials from name
     * @param {string} name - Full name
     * @returns {string} Initials
     */
    getInitials(name) {
        if (!name) return '?';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            window.rosterManager = new RosterManager();
        } catch (error) {
            // Silently handle errors
        }
    });
} else {
    try {
        window.rosterManager = new RosterManager();
    } catch (error) {
        // Silently handle errors
    }
}
