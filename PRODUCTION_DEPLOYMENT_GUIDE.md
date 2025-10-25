# 🚀 Production Deployment Checklist

## Current Status
- ✅ Frontend ready for static hosting (Netlify/Render)  
- ✅ Configuration system created for automatic environment detection
- ❌ Backend services need separate deployment

---

## 📋 Step-by-Step Deployment Guide

### Phase 1: Frontend Deployment (Static Website)
This will work immediately:

1. **Deploy to Netlify** (Recommended)
   ```bash
   # Push to GitHub first
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```
   - Go to netlify.com → "New site from Git" → Select your repository
   - Netlify auto-detects settings from `netlify.toml`

2. **What works after Phase 1:**
   - ✅ All static pages (home, about, apply, etc.)
   - ✅ Basic styling and interactions
   - ✅ Profile system (local storage)
   - ❌ Discord login (needs backend)
   - ❌ Discord member count (needs backend)

### Phase 2: Backend Services Deployment
Required for full functionality:

#### Service 1: Discord Proxy (Member Count)
1. **Deploy on Render:**
   - Create new Web Service
   - Connect GitHub repo
   - Root Directory: `backend/discord-proxy`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - **Note:** node_modules removed for deployment (will be installed automatically)
   - Environment Variables:
     ```
     DISCORD_BOT_TOKEN=your_bot_token
     DISCORD_GUILD_ID=your_server_id
     ```

#### Service 2: OAuth Handler (Discord Login)
1. **Deploy on Render:**
   - Create new Web Service  
   - Root Directory: `backend/oauth-handler`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     DISCORD_CLIENT_ID=1430027033072898088
     DISCORD_CLIENT_SECRET=D9rPKwikL1eVvzociFcpGRZHpaPX7H2j
     FRONTEND_URL=https://your-netlify-url.netlify.app
     DISCORD_REDIRECT_URI=https://your-render-oauth.onrender.com/auth/discord/callback
     JWT_SECRET=your_jwt_secret
     ```

#### Service 3: Update Frontend Config
1. **Update production URLs** in `assets/js/config.js`:
   ```javascript
   production: {
       discord: 'https://your-discord-service.onrender.com',
       oauth: 'https://your-oauth-service.onrender.com',
       // ... other services
   }
   ```

---

## 🔧 Required Environment Variables

### Discord Proxy Service
- `DISCORD_BOT_TOKEN` - Get from Discord Developer Portal
- `DISCORD_GUILD_ID` - Your Team Zorn server ID

### OAuth Handler Service  
- `DISCORD_CLIENT_ID` - Already configured (1430027033072898088)
- `DISCORD_CLIENT_SECRET` - Already configured  
- `FRONTEND_URL` - Your Netlify URL
- `DISCORD_REDIRECT_URI` - Your OAuth service URL + /auth/discord/callback
- `JWT_SECRET` - Generate a secure random string

---

## 🎯 Minimal Working Deployment

**Option 1: Static Only (Quick)**
- Deploy frontend to Netlify → Basic website works immediately
- Discord features disabled until backend deployed

**Option 2: Full Featured (Complete)**
- Deploy frontend + 2 backend services → Everything works

---

## 📝 Next Steps

1. **Immediate:** Deploy static site to Netlify (5 minutes)
2. **Later:** Deploy backend services when you need Discord features
3. **Update:** Replace placeholder URLs in config.js with actual service URLs

The configuration system will automatically detect production vs development and use the appropriate API endpoints!

---

## 🆘 Need Help?

If you get stuck during deployment:
1. Check the DEPLOYMENT.md file for detailed instructions
2. Verify all environment variables are set correctly  
3. Test each service individually before connecting them