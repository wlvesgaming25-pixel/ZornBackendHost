/**
 * Production Configuration
 * Automatically detects environment and sets appropriate API endpoints
 */

class ProductionConfig {
    constructor() {
    this.API_BASE_URL = 'https://zorn.team/api';
    this.FRONTEND_URL = 'https://zorn.team';
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
                discord: 'https://zornbackendhost-1.onrender.com',  // ✅ LIVE - Discord Proxy
                oauth: 'https://zorn-oauth-handler.onrender.com',      // ✅ LIVE - OAuth Handler
                contact: 'https://zorn-backend-contact.onrender.com',   // Future service
                applications: 'https://zorn-backend-apps.onrender.com' // Future service
            }
        };
        this.API_BASE_URL = 'https://zorn.team/api';
        this.FRONTEND_URL = 'https://zorn.team';
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

// Silent initialization - no console output needed