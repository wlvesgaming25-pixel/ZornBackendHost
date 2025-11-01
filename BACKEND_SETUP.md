# 🚀 Backend Setup Quick Guide

## Overview
The Zorn Website 2.0 now includes a complete backend system with 4 microservices:

1. **Main Service** (`backend/index.js`) - Health monitoring and service coordination
2. **Discord Proxy** (`backend/discord-proxy/`) - Server stats and member count
3. **Contact Handler** (`backend/contact-handler/`) - Contact form processing
4. **Application Handler** (`backend/application-handler/`) - Team application system

## Quick Setup

### 1. Environment Configuration
Each service needs its own `.env` file. Copy from `.env.example` files in each directory.

### 2. Required Environment Variables

#### Discord Proxy Service
```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_discord_server_id
PORT=3001
```

#### Contact Handler Service  
```env
EMAIL_USER=your_smtp_email@gmail.com
EMAIL_PASS=your_app_password
PORT=3002
```

#### Application Handler Service
```env
EMAIL_USER=your_smtp_email@gmail.com
EMAIL_PASS=your_app_password
PORT=3003
```

### 3. Deployment Options

#### Option A: Individual Services (Recommended)
Deploy each service separately on Render/Railway/Heroku:
- `backend/discord-proxy/` → Discord service
- `backend/contact-handler/` → Contact service  
- `backend/application-handler/` → Application service
- `backend/` → Main coordinator (optional)

#### Option B: Single Service
Use the main `backend/index.js` which runs all services on one server.

### 4. Update Frontend URLs
After deployment, update these files with your backend URLs:
- `assets/js/discord-stats.js` - Update `DISCORD_API_URL`
- `assets/js/contact.js` - Update `CONTACT_API_URL`
- `assets/js/applications.js` - Update `APPLICATION_API_URL`

## Production Ready Features

✅ **Security**: Rate limiting, CORS, input validation, Helmet security headers
✅ **Reliability**: Error handling, health checks, graceful shutdowns
✅ **Scalability**: Microservices architecture, individual scaling
✅ **Monitoring**: Health endpoints, service status tracking
✅ **Deployment**: Multi-platform support with comprehensive documentation

## Need Help?

- 📖 **Full Documentation**: [backend/README.md](backend/README.md)
- 🚀 **Deployment Guide**: [backend/DEPLOYMENT_CONFIG.md](backend/DEPLOYMENT_CONFIG.md) 
- 🔧 **Individual Services**: Each service has its own README with specific setup instructions

---
*This backend system makes your website production-ready with professional features for team management, Discord integration, and user engagement.*