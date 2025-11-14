// Discord Stats Counter for Team Zorn
class DiscordStatsCounter {
    constructor() {
        this.backendUrls = this.getBackendUrls();
        this.currentBackendIndex = 0;
        this.updateInterval = 30000; // Update every 30 seconds
        
        this.init();
    }
    
    getBackendUrls() {
        try {
            // Initialize ProductionConfig if not available
            if (!this.config) {
                this.config = window.ProductionConfig || new ProductionConfig();
            }
            
            // Use the correct Discord API URL from config
            const discordUrl = this.config.getDiscordApiUrl();
            return [discordUrl];
        } catch (error) {
            // Silently fallback to default
            return ['https://zornbackendhost-1.onrender.com'];
        }
    }
    
    async init() {
        this.animateNumbers(); // Set initial 0 values
        await this.fetchInitialData();
        this.startCounter();
    }
    
    // Fetch initial Discord data and start real-time updates
    async fetchInitialData() {
        try {
            // Fetch all data first
            const [discordData, teamData] = await Promise.all([
                this.fetchDiscordData(),
                this.fetchTeamData()
            ]);
            
            // Start all animations simultaneously
            this.startAllAnimations(discordData, teamData);
            
        } catch (error) {
            // Silently use fallback values
            this.setFallbackValues();
        }
    }
    
    async fetchDiscordData() {
        try {
            const backendUrl = this.backendUrls[this.currentBackendIndex];
            const response = await fetch(`${backendUrl}/api/discord/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                totalMembers: data.total_members || data.members || 0,
                teamMembers: data.team_member_count || data.team_members || 0,
                online: data.online_members || data.online || 0,
                roles: data.roles || 0
            };
        } catch (error) {
            console.log('Discord API not available, using fallback stats');
            // Use fallback data - backend not accessible
            return {
                totalMembers: 0,
                teamMembers: 0,
                online: 0,
                roles: 0
            };
        }
    }
    
    async fetchTeamData() {
        // Use fallback data - backend not accessible in local development
        return 45;
    }
    
    startAllAnimations(discordData, teamCount) {
        const discordElement = document.getElementById('discord-members');
        const membersElement = document.getElementById('total-members');
        const onlineElement = document.getElementById('discord-online');
        const supportersElement = document.getElementById('estimated-supporters');
        
        // Reset all to 0 first
        if (discordElement) discordElement.textContent = '0';
        if (membersElement) membersElement.textContent = '0';
        if (onlineElement) onlineElement.textContent = '0';
        if (supportersElement) supportersElement.textContent = '0';
        
        // Compute roles total (sum of members across roles) to display as the second counter
        let rolesTotal = 0;
        try {
            const roles = discordData.roles;
            if (Array.isArray(roles)) {
                rolesTotal = roles.reduce((sum, r) => sum + (r.count || r.members || r.member_count || 0), 0);
            } else if (roles && typeof roles === 'object') {
                // roles might be an object mapping roleName -> count or id -> {name, count}
                rolesTotal = Object.values(roles).reduce((sum, v) => {
                    if (typeof v === 'number') return sum + v;
                    if (v && typeof v === 'object') return sum + (v.count || v.members || v.member_count || 0);
                    return sum;
                }, 0);
            }
        } catch (err) {
            rolesTotal = 0;
        }

        // Start all animations at exactly the same time using requestAnimationFrame
        const startTime = performance.now();
        const duration = 2000; // 2 seconds
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smoother animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update all counters simultaneously
            if (discordElement && discordData.totalMembers > 0) {
                const currentValue = Math.floor(discordData.totalMembers * easeProgress);
                discordElement.textContent = currentValue.toLocaleString();
            }
            
            // Second counter now shows total members across tracked roles (rolesTotal)
            if (onlineElement && rolesTotal > 0) {
                const currentValue = Math.floor(rolesTotal * easeProgress);
                onlineElement.textContent = currentValue.toLocaleString();
            }
            
            if (membersElement && teamCount > 0) {
                const currentValue = Math.floor(teamCount * easeProgress);
                membersElement.textContent = currentValue.toLocaleString();
            }
            
            if (supportersElement) {
                const currentValue = Math.floor(700 * easeProgress);
                supportersElement.textContent = currentValue.toLocaleString() + '+';
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start the animation
        requestAnimationFrame(animate);
        
        // Render role counts if available
        try {
            this.renderRoles(discordData.roles);
        } catch (err) {
            console.warn('Failed to render roles:', err);
        }
    }

    // Render role member counts into the #discord-roles container
    renderRoles(roles) {
        const rolesContainer = document.getElementById('discord-roles');
        if (!rolesContainer) return;

        // Clear existing content
        rolesContainer.innerHTML = '';

        if (!roles) {
            rolesContainer.textContent = 'Role data not available';
            return;
        }

        // Roles may come as an array or an object mapping
        let entries = [];
        if (Array.isArray(roles)) {
            // Expecting array of { id, name, count } or { name, members }
            entries = roles.map(r => {
                return {
                    name: r.name || r.role || 'Unknown',
                    count: r.count || r.members || r.member_count || 0
                };
            });
        } else if (typeof roles === 'object') {
            // If it's an object, try to convert to array of { name, count }
            entries = Object.keys(roles).map(key => {
                const val = roles[key];
                if (typeof val === 'number') return { name: key, count: val };
                if (typeof val === 'object') return { name: val.name || key, count: val.count || val.members || val.member_count || 0 };
                return { name: key, count: 0 };
            });
        }

        // Sort by count desc and show top 8 roles
        entries.sort((a, b) => (b.count || 0) - (a.count || 0));
        const top = entries.slice(0, 8);

        top.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'role-item';
            item.innerHTML = `
                <span class="role-name">${entry.name}</span>
                <span class="role-count">${(entry.count || 0).toLocaleString()}</span>
            `;
            rolesContainer.appendChild(item);
        });
    }
    
    // Start real-time counting with API updates
    startCounter() {
        setInterval(async () => {
            try {
                // Fetch all data first, then animate simultaneously
                const [discordData, teamData] = await Promise.all([
                    this.fetchDiscordData(),
                    this.fetchTeamData()
                ]);
                
                // Start all animations at the same time
                this.startAllAnimations(discordData, teamData);
                
            } catch (error) {
                console.warn('Failed to update Discord stats:', error);
            }
        }, this.updateInterval);
    }
    
    setFallbackValues() {
        const discordElement = document.getElementById('discord-members');
        const membersElement = document.getElementById('total-members');
        const onlineElement = document.getElementById('discord-online');
        const supportersElement = document.getElementById('estimated-supporters');
        
        if (discordElement) discordElement.textContent = '--';
        if (onlineElement) onlineElement.textContent = '--';
        if (membersElement) membersElement.textContent = '--';
        if (supportersElement) supportersElement.textContent = '--';
    }
    
    animateNumbers() {
        // Set initial values to -- for all counters
        const discordElement = document.getElementById('discord-members');
        const membersElement = document.getElementById('total-members');
        const onlineElement = document.getElementById('discord-online');
        const supportersElement = document.getElementById('estimated-supporters');
        
        if (discordElement) discordElement.textContent = '--';
        if (onlineElement) onlineElement.textContent = '--';
        if (membersElement) membersElement.textContent = '--';
        if (supportersElement) supportersElement.textContent = '--';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new DiscordStatsCounter();
    } catch (error) {
        // Silently fail - stats will show fallback values
    }
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiscordStatsCounter;
}