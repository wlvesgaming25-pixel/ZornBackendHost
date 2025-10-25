// Discord Stats Counter for Team Zorn
class DiscordStatsCounter {
    constructor() {
        this.backendUrls = this.getBackendUrls();
        this.currentBackendIndex = 0;
        this.updateInterval = 30000; // Update every 30 seconds
        
        this.init();
    }
    
    getBackendUrls() {
        // Use ProductionConfig if available, fallback to manual detection
        if (window.ProductionConfig) {
            const discordUrl = window.ProductionConfig.getDiscordApiUrl();
            return [discordUrl];
        }
        
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            return [
                'http://localhost:3001',
                'http://127.0.0.1:3001'
            ];
        } else {
            // For production, try production backend URLs
            return [
                'https://zorn-backend-discord.onrender.com',
                'https://zorn-backend-discord.herokuapp.com'
            ];
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
            console.warn('Failed to fetch initial Discord data:', error);
            // Fallback to placeholders
            this.setFallbackValues();
        }
    }
    
    async fetchDiscordData() {
        for (let i = 0; i < this.backendUrls.length; i++) {
            try {
                const backendUrl = this.backendUrls[i];
                console.log('Fetching Discord members...');
                console.log('Backend URL:', `${backendUrl}/api/discord/members`);
                const response = await fetch(`${backendUrl}/api/discord/members`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Discord members data:', data);
                this.currentBackendIndex = i; // Remember working proxy
                return data.total_members || 0;
            } catch (error) {
                console.error(`Failed to fetch Discord members from ${this.backendUrls[i]}:`, error);
                console.log('Network error details:', error.message);
                if (i === this.backendUrls.length - 1) {
                    // Last attempt failed
                    return 0;
                }
            }
        }
        return 0;
    }
    
    async fetchTeamData() {
        for (let i = 0; i < this.backendUrls.length; i++) {
            try {
                const backendUrl = this.backendUrls[i];
                console.log('Fetching team members...');
                console.log('Backend URL:', `${backendUrl}/api/discord/team-members`);
                const response = await fetch(`${backendUrl}/api/discord/team-members`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Team members data:', data);
                return data.team_member_count || 0;
            } catch (error) {
                console.error(`Failed to fetch team members from ${this.backendUrls[i]}:`, error);
                console.log('Network error details:', error.message);
                if (i === this.backendUrls.length - 1) {
                    // Last attempt failed
                    return 0;
                }
            }
        }
        return 0;
    }
    
    startAllAnimations(discordCount, teamCount) {
        const discordElement = document.getElementById('discord-members');
        const membersElement = document.getElementById('total-members');
        const supportersElement = document.getElementById('estimated-supporters');
        
        // Reset all to 0 first
        if (discordElement) discordElement.textContent = '0';
        if (membersElement) membersElement.textContent = '0';
        if (supportersElement) supportersElement.textContent = '0';
        
        // Start all animations at exactly the same time using requestAnimationFrame
        const startTime = performance.now();
        const duration = 2000; // 2 seconds
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smoother animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update all counters simultaneously
            if (discordElement && discordCount > 0) {
                const currentValue = Math.floor(discordCount * easeProgress);
                discordElement.textContent = currentValue.toLocaleString();
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
        const supportersElement = document.getElementById('estimated-supporters');
        
        if (discordElement) discordElement.textContent = '400+';
        if (membersElement) membersElement.textContent = '29+';
        if (supportersElement) supportersElement.textContent = '350+';
    }
    
    animateNumbers() {
        // Set initial values to 0 for all counters
        const discordElement = document.getElementById('discord-members');
        const membersElement = document.getElementById('total-members');
        const supportersElement = document.getElementById('estimated-supporters');
        
        if (discordElement) discordElement.textContent = '0';
        if (membersElement) membersElement.textContent = '0';
        if (supportersElement) supportersElement.textContent = '0';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DiscordStatsCounter();
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiscordStatsCounter;
}