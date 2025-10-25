# 🏠 Local Development OAuth Setup

Your OAuth service is now configured for localhost testing! Here's what you need to do:

## ✅ **Current Configuration:**
```
Frontend URL: http://localhost:5500
Discord Redirect: http://localhost:3004/auth/discord/callback  
Google Redirect: http://localhost:3004/auth/google/callback
OAuth Service: Running on http://localhost:3004
```

## 🔧 **Update Your OAuth Apps:**

### **1. Discord Developer Portal:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your "Zorn Website" application
3. Go to "OAuth2" → "General"  
4. **Add this redirect URI:** `http://localhost:3004/auth/discord/callback`
5. Keep your production URI for later: `https://zorn.team/auth/discord/callback`
6. Save changes

### **2. Google Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "Zorn Website" project
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. **Add this redirect URI:** `http://localhost:3004/auth/google/callback`
6. Keep your production URI for later: `https://zorn.team/auth/google/callback`  
7. Save changes

## 🧪 **Testing Your Setup:**

### **1. Start Your Website:**
```bash
# Using VS Code Live Server (port 5500) - recommended
# Right-click on index.html → "Open with Live Server"
# Or use any method to serve your site on port 5500
```

### **2. Test OAuth Flows:**
1. **Visit:** http://localhost:5500/login.html
2. **Click "Login with Discord"** - should redirect to Discord
3. **Click "Login with Google"** - should redirect to Google  
4. **Authorize** on the provider
5. **Get redirected back** to your localhost website (logged in!)

### **3. Direct Testing:**
- **Discord:** http://localhost:3004/auth/discord
- **Google:** http://localhost:3004/auth/google
- **Health Check:** http://localhost:3004/health

## 🚀 **When Ready for Production:**

Just update these values in `backend/oauth-handler/.env`:
```env
FRONTEND_URL=https://zorn.team
DISCORD_REDIRECT_URI=https://zorn.team/auth/discord/callback
GOOGLE_REDIRECT_URI=https://zorn.team/auth/google/callback
CORS_ORIGINS=https://zorn.team
```

And make sure your OAuth apps have the production redirect URIs added too!

## ✨ **You're All Set!**

Your OAuth system is now configured for local development. Test those login buttons! 🔐