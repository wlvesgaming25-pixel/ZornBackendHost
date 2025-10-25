# Backend Deployment Configuration

This document outlines how to deploy and connect the Team Zorn backend services for production use.

## 🏗️ Backend Services Architecture

```
Frontend (Static Website)
    ↓
Backend Services:
├── Discord Proxy (Port 3001)      → Discord API
├── Contact Handler (Port 3002)    → Email Service
├── Application Handler (Port 3003) → Email + File Storage
└── Main Coordinator (Port 3000)   → Health Monitoring
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend Services

#### Option A: Render (Recommended)
1. **Create 4 separate Web Services** on Render:
   - `zorn-backend-main` (from `/backend`)
   - `zorn-backend-discord` (from `/backend/discord-proxy`)  
   - `zorn-backend-contact` (from `/backend/contact-handler`)
   - `zorn-backend-applications` (from `/backend/application-handler`)

2. **Configure Build Commands**:
   ```bash
   # For main backend
   Build Command: npm install
   Start Command: npm start
   
   # For each service
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables** (see individual .env.example files)

#### Option B: Railway
1. **Deploy from GitHub** - Connect repository
2. **Create separate services** for each backend component
3. **Configure environment variables** in Railway dashboard

#### Option C: Heroku
1. **Create 4 separate Heroku apps**
2. **Deploy each service** using Git subtree:
   ```bash
   git subtree push --prefix=backend heroku-main main
   git subtree push --prefix=backend/discord-proxy heroku-discord main
   ```

### Step 2: Update Frontend URLs

Update the following files with your deployed backend URLs:

#### `assets/js/contact.js`
```javascript
function getBackendUrl(endpoint) {
    const isDevelopment = window.location.hostname === 'localhost';
    
    if (isDevelopment) {
        return `http://localhost:3002${endpoint}`;
    } else {
        return `https://your-contact-service.onrender.com${endpoint}`;
    }
}
```

#### `assets/js/discord-stats.js` 
```javascript
getBackendUrls() {
    const isDevelopment = window.location.hostname === 'localhost';
    
    if (isDevelopment) {
        return ['http://localhost:3001/api'];
    } else {
        return ['https://your-discord-service.onrender.com/api'];
    }
}
```

#### `assets/js/applications.js`
```javascript
getBackendUrl() {
    const isDevelopment = window.location.hostname === 'localhost';
    
    if (isDevelopment) {
        return 'http://localhost:3003';
    } else {
        return 'https://your-applications-service.onrender.com';
    }
}
```

## 🔧 Environment Variables Setup

### Discord Service
```env
PORT=3001
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_server_id
DISCORD_MEMBER_ROLE_ID=your_member_role_id
FRONTEND_URL=https://your-website.netlify.app
```

### Contact Service  
```env
PORT=3002
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your_app_password
CONTACT_EMAIL=contact@teamzorn.com
FRONTEND_URL=https://your-website.netlify.app
```

### Application Service
```env
PORT=3003
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your_app_password
APPLICATIONS_EMAIL=applications@teamzorn.com
FRONTEND_URL=https://your-website.netlify.app
```

## 📧 Email Configuration

### Gmail Setup
1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Account Settings → Security → 2-Step Verification → App Passwords
   - Select "Mail" and generate password
3. **Use App Password** in `EMAIL_APP_PASSWORD` environment variable

### Custom Domain Email (Optional)
If using a custom domain email:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
EMAIL_USER=contact@teamzorn.com
EMAIL_PASSWORD=your_email_password
```

## 🤖 Discord Bot Setup

### Create Discord Application
1. Go to https://discord.com/developers/applications
2. **Create New Application** → Name it "Team Zorn Bot"
3. **Bot Section** → Create Bot → Copy Token
4. **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Read Messages/View Channels`, `Read Message History`

### Get Server/Role IDs
1. **Enable Developer Mode** in Discord
2. **Right-click your server** → Copy ID (Guild ID)
3. **Right-click member role** → Copy ID (Role ID)

## 🌐 CORS Configuration

Update CORS origins in each service to include your deployed frontend URL:

```javascript
const corsOptions = {
    origin: [
        'http://localhost:8000',
        'https://your-website.netlify.app',
        'https://your-website.onrender.com',
        'https://your-custom-domain.com'
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🔍 Testing Backend Services

### Health Check URLs
- Main Backend: `https://your-main-backend.onrender.com/health`
- Discord Service: `https://your-discord-service.onrender.com/health`
- Contact Service: `https://your-contact-service.onrender.com/health`
- Applications Service: `https://your-applications-service.onrender.com/health`

### API Testing
```bash
# Test Discord service
curl https://your-discord-service.onrender.com/api/discord/members

# Test contact service
curl -X POST https://your-contact-service.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'

# Test application service  
curl https://your-applications-service.onrender.com/health
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Solution: Add your frontend domain to CORS origins in backend services
   ```

2. **Email Not Sending**
   ```
   Check: Gmail app password, less secure apps setting
   Solution: Use Gmail app password, not regular password
   ```

3. **Discord API Errors**
   ```
   Check: Bot token, server ID, role ID, bot permissions
   Solution: Verify bot is in server with correct permissions
   ```

4. **Service Not Starting**
   ```
   Check: Environment variables, port conflicts, dependencies
   Solution: Verify all required env vars are set
   ```

### Render-Specific Issues

1. **Service Sleep**
   ```
   Issue: Free tier services sleep after 15 minutes
   Solution: Upgrade to paid plan or implement keep-alive pings
   ```

2. **Build Failures**
   ```
   Check: package.json in correct directory, build logs
   Solution: Ensure each service has proper package.json
   ```

## 📊 Monitoring & Logs

### Render Dashboard
- **Logs**: Real-time service logs
- **Metrics**: CPU, memory, response times
- **Deployments**: Deployment history and status

### Health Monitoring
Set up monitoring for:
- Service uptime
- Response times
- Error rates
- Email delivery success

## 🔄 Deployment Automation

### GitHub Actions (Optional)
Create workflow to auto-deploy backend changes:

```yaml
name: Deploy Backend Services

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Use Render deploy hook or API
        run: |
          curl -X POST "https://api.render.com/deploy/srv-xxx"
```

## ✅ Production Checklist

- [ ] All 4 backend services deployed and running
- [ ] Environment variables configured
- [ ] CORS origins updated for production
- [ ] Frontend URLs updated to point to backend services
- [ ] Discord bot configured and in server
- [ ] Email service tested and working
- [ ] Health checks passing
- [ ] Domain names configured (if using custom domains)
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backup procedures documented

---

**🎯 Once completed, your Team Zorn website will have a fully functional backend system supporting Discord integration, contact forms, and application processing!**