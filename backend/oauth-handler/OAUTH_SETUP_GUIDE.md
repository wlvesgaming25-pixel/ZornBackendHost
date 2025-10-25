# OAuth Setup Guide - Discord & Google Login

This guide will walk you through setting up Discord and Google OAuth applications for your Zorn website.

## 1. Discord OAuth Application Setup

### Step 1: Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Zorn Website" or similar
4. Click "Create"

### Step 2: Configure OAuth2 Settings
1. Go to "OAuth2" → "General" in the sidebar
2. Add these redirect URIs:
   - `https://zorn.team/auth/discord/callback` (production)
   - `http://localhost:3000/auth/discord/callback` (development)
3. Copy your **Client ID** and **Client Secret**

### Step 3: Update Environment Variables
In your `backend/oauth-handler/.env` file:
```env
DISCORD_CLIENT_ID=your-client-id-here
DISCORD_CLIENT_SECRET=your-client-secret-here
DISCORD_REDIRECT_URI=https://zorn.team/auth/discord/callback
```

## 2. Google OAuth Application Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Zorn Website"

### Step 2: Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" 
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Zorn Website"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email and any others you want)

### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name it "Zorn Website"
5. Add authorized redirect URIs:
   - `https://zorn.team/auth/google/callback` (production)
   - `http://localhost:3000/auth/google/callback` (development)
6. Copy your **Client ID** and **Client Secret**

### Step 5: Update Environment Variables
In your `backend/oauth-handler/.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://zorn.team/auth/google/callback
```

## 3. Complete Environment Configuration

Your final `backend/oauth-handler/.env` should look like:

```env
# Server Configuration
PORT=3003
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://zorn.team

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Discord OAuth Configuration
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=https://zorn.team/auth/discord/callback

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://zorn.team/auth/google/callback

# CORS Origins
CORS_ORIGINS=https://zorn.team,http://localhost:3000,http://127.0.0.1:3000
```

## 4. Install Dependencies & Start Service

```bash
cd backend/oauth-handler
npm install
npm start
```

## 5. Testing the Setup

### Local Testing URLs:
- Discord: http://localhost:3003/auth/discord
- Google: http://localhost:3003/auth/google
- Health: http://localhost:3003/health

### Production URLs:
- Discord: https://your-backend-url.com/auth/discord
- Google: https://your-backend-url.com/auth/google

## 6. Security Notes

🔒 **Important Security Considerations:**

1. **JWT Secret**: Use a long, random string for `JWT_SECRET`
2. **HTTPS Only**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files to git
4. **Domain Validation**: Ensure redirect URIs match exactly
5. **Rate Limiting**: The service includes built-in rate limiting

## 7. Integration with Main Backend

Add to your main `backend/index.js` or deployment configuration:

```javascript
// Proxy OAuth requests to auth handler
app.use('/auth', proxy('http://localhost:3003'));
app.use('/api/auth', proxy('http://localhost:3003'));
```

## 8. Common Issues & Solutions

### Discord Issues:
- **Invalid Redirect URI**: Check exact URL match in Discord app settings
- **Invalid Client**: Verify Client ID and Secret are correct
- **Scope Issues**: Ensure you're only requesting `identify email`

### Google Issues:
- **Consent Screen**: Make sure OAuth consent screen is configured
- **API Not Enabled**: Enable Google+ API in Google Cloud Console
- **Test Users**: Add yourself as a test user during development
- **Verification**: For production, you may need Google verification

### General Issues:
- **CORS Errors**: Check CORS_ORIGINS includes your frontend domain
- **JWT Errors**: Verify JWT_SECRET is set and consistent
- **Cookie Issues**: Check secure/sameSite settings match your setup

## 9. Production Deployment

When deploying:
1. Update all URLs from localhost to your production domain
2. Set `NODE_ENV=production`
3. Use secure JWT secret
4. Ensure HTTPS is configured
5. Update OAuth app redirect URIs to production URLs

## 10. Next Steps

After configuration:
1. Test both Discord and Google login flows
2. Update your frontend to use the new OAuth endpoints
3. Implement proper error handling for failed logins
4. Consider adding user profile management features