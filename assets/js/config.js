/**
 * Production Configuration
 * Automatically detects environment and sets appropriate API endpoints
 */

class ProductionConfig {
    constructor() {
        this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        this.isDevelopment = !this.isProduction;
        
        // Production API URLs (update these when you deploy backend services)
        this.API_ENDPOINTS = {
            development: {
                discord: 'http://localhost:3001',
                oauth: 'http://localhost:3004',
                contact: 'http://localhost:3002',
                applications: 'http://localhost:3003'
            },
            production: {
                // TODO: Update these URLs after deploying backend services
                discord: 'https://zorn-backend-discord.onrender.com',  // Replace with actual URL
                oauth: 'https://zorn-backend-oauth.onrender.com',      // Replace with actual URL  
                contact: 'https://zorn-backend-contact.onrender.com',   // Replace with actual URL
                applications: 'https://zorn-backend-apps.onrender.com' // Replace with actual URL
            }
        };
    }

    getApiEndpoint(service) {
        const env = this.isProduction ? 'production' : 'development';
        return this.API_ENDPOINTS[env][service];
    }

    getDiscordApiUrl() {
        return this.getApiEndpoint('discord');
    }

    getOAuthUrl() {
        return this.getApiEndpoint('oauth');
    }

    getContactApiUrl() {
        return this.getApiEndpoint('contact');
    }

    getApplicationsApiUrl() {
        return this.getApiEndpoint('applications');
    }

    // Get environment-specific settings
    getSettings() {
        return {
            environment: this.isProduction ? 'production' : 'development',
            debug: this.isDevelopment,
            apiTimeout: this.isProduction ? 10000 : 5000,
            retryAttempts: this.isProduction ? 3 : 1
        };
    }
}

// Initialize global config
window.ProductionConfig = new ProductionConfig();

console.log('🔧 Environment detected:', window.ProductionConfig.getSettings().environment);
console.log('🌐 API Endpoints:', {
    discord: window.ProductionConfig.getDiscordApiUrl(),
    oauth: window.ProductionConfig.getOAuthUrl()
});