# 🚀 Zorn Website 2.0 - Deployment Checklist

## ✅ Pre-Deployment Testing

### Frontend Testing
- [x] All HTML pages load without errors
- [x] All CSS files properly linked
- [x] All JavaScript files load correctly
- [x] Navigation works across all pages
- [x] Responsive design works on mobile/tablet/desktop
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [x] All images load correctly
- [x] Favicon displays properly

### Feature Testing

#### Authentication & Access Control
- [x] OAuth login flow works
- [x] Local session management functional
- [x] Dashboard access control enforced (email whitelist)
- [x] Profile page loads user data
- [x] Logout functionality works

#### Application System
- [ ] All 8 application forms submit successfully
- [ ] Form validation works (email, Discord tag, required fields)
- [ ] Success messages display after submission
- [ ] Applications save to localStorage
- [ ] Dashboard displays submitted applications
- [ ] Application status changes (pending → accepted/denied)
- [ ] Application modal shows full details

#### Roster Integration
- [ ] Accepted applications auto-add to roster
- [ ] Roster displays team members correctly
- [ ] Roster filtering works (all, freestyler, competitive, etc.)
- [ ] Roster search functionality works
- [ ] Social links display correctly

#### Discord Integration
- [ ] Discord stats fetch from backend API
- [ ] Member count displays on homepage
- [ ] Team member count shows correctly
- [ ] Online status updates
- [ ] Fallback data works when API unavailable

#### Settings & Accessibility
- [ ] Theme switching (Light/Dark/Auto) works
- [ ] Font size adjustment applies globally
- [ ] High contrast mode works
- [ ] Reduce motion toggle works
- [ ] Dyslexia-friendly font applies
- [ ] Letter spacing adjustment works
- [ ] Line height adjustment works
- [ ] Settings persist across page reloads
- [ ] Settings apply on all pages

#### Help Center
- [ ] FAQ accordion expands/collapses
- [ ] Search filters questions correctly
- [ ] Text highlighting in search results
- [ ] Keyboard navigation works
- [ ] Copy link to question works
- [ ] Scroll to section from quick links

#### Contact Form
- [ ] Contact form submits successfully
- [ ] Email validation works
- [ ] Success message displays
- [ ] Form data saves/sends correctly

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Images optimized and compressed
- [ ] CSS/JS files load efficiently
- [ ] No console errors on any page
- [ ] localStorage quota not exceeded
- [ ] Animations smooth on all devices

### Backend Testing

#### Discord Proxy Server
- [ ] Server starts successfully (`node backend/discord-proxy/server.js`)
- [ ] `/api/discord/stats` endpoint responds
- [ ] CORS configured correctly
- [ ] Bot token valid and working
- [ ] Guild ID correct
- [ ] Member role ID correct
- [ ] Error handling works

#### Application Handler
- [ ] Server starts successfully
- [ ] Application submissions received
- [ ] Data validation on backend
- [ ] Email notifications sent (if implemented)
- [ ] Database/storage working

#### Contact Handler
- [ ] Server starts successfully
- [ ] Contact form submissions received
- [ ] Email sending works
- [ ] Spam protection active

### Security Checklist
- [x] Email whitelist enforced for dashboard
- [x] Input validation on all forms
- [ ] XSS protection in place
- [ ] CSRF tokens (if using API)
- [ ] Secure environment variables
- [ ] No sensitive data in client-side code
- [ ] API keys properly secured
- [ ] Rate limiting on API endpoints

## 🔧 Deployment Configuration

### Environment Variables Required
```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_MEMBER_ROLE_ID=your_member_role_id_here

# OAuth Configuration (if using)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=your_redirect_uri

# Email Configuration (for contact form)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@zornteam.com

# Application Configuration
PORT=3000
NODE_ENV=production
```

### Files to Deploy

#### Frontend Files (Static Hosting - Netlify/Vercel/GitHub Pages)
```
✓ index.html
✓ about.html
✓ roster.html
✓ apply.html + all apply-*.html forms
✓ partners.html
✓ store.html
✓ contact.html
✓ login.html
✓ profile.html
✓ dashboard.html
✓ help.html
✓ settings.html
✓ 404.html
✓ oauth-success.html
✓ assets/ (entire directory)
  ├── css/
  ├── js/
  ├── img/
  └── fonts/
✓ _redirects (Netlify)
✓ netlify.toml
✓ robots.txt
✓ sitemap.xml
```

#### Backend Files (Node.js Hosting - Render/Railway/Heroku)
```
✓ backend/
  ├── discord-proxy/
  │   ├── server.js
  │   └── package.json
  ├── application-handler/
  │   ├── server.js
  │   └── package.json
  ├── contact-handler/
  │   ├── server.js
  │   └── package.json
  └── oauth-handler/
      ├── server.js
      └── package.json
```

### Deployment Steps

#### 1. Frontend Deployment (Netlify)
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Initialize site
netlify init

# 4. Deploy
netlify deploy --prod
```

#### 2. Backend Deployment (Render/Railway)

**Option A: Render.com**
1. Create account at render.com
2. Connect GitHub repository
3. Create new "Web Service"
4. Set build command: `cd backend/discord-proxy && npm install`
5. Set start command: `node backend/discord-proxy/server.js`
6. Add environment variables
7. Deploy

**Option B: Railway.app**
1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Add service for each backend (discord-proxy, application-handler, etc.)
4. Configure environment variables
5. Deploy

#### 3. Update Frontend Config
After backend is deployed, update `assets/js/config.js`:

```javascript
class ProductionConfig {
    static BACKEND_URL = 'https://your-backend.render.com'; // Update this!
    static OAUTH_URL = 'https://your-oauth.render.com';
    static DISCORD_PROXY_URL = 'https://your-discord.render.com';
    
    // ... rest of config
}
```

### DNS & Domain Setup
1. Purchase domain (e.g., zornteam.com)
2. Add custom domain to Netlify
3. Configure DNS records:
   ```
   A     @       104.198.14.52 (Netlify)
   CNAME www     [your-site].netlify.app
   CNAME api     [your-backend].render.com
   ```
4. Enable HTTPS/SSL
5. Update CORS settings in backend to allow your domain

### Post-Deployment Verification

#### Frontend Checks
- [ ] Visit https://your-domain.com
- [ ] All pages accessible
- [ ] Images loading
- [ ] Forms submitting
- [ ] OAuth login working
- [ ] Settings persisting

#### Backend Checks
- [ ] API endpoints responding
- [ ] Discord stats fetching
- [ ] Application submissions working
- [ ] Contact form sending emails
- [ ] CORS allowing frontend requests

#### Analytics & Monitoring
- [ ] Google Analytics installed (optional)
- [ ] Error tracking (Sentry) configured (optional)
- [ ] Uptime monitoring active (UptimeRobot)
- [ ] Performance monitoring (Lighthouse scores)

### Performance Optimization

#### Before Final Deployment
```bash
# 1. Minify CSS (optional - can use build tools)
# Install clean-css-cli
npm install -g clean-css-cli

# Minify all CSS files
for file in assets/css/*.css; do
    cleancss -o "${file%.css}.min.css" "$file"
done

# 2. Minify JavaScript (optional)
# Install terser
npm install -g terser

# Minify all JS files
for file in assets/js/*.js; do
    terser "$file" -o "${file%.js}.min.js"
done

# 3. Optimize images
# Use tools like ImageOptim, TinyPNG, or squoosh.app
```

### Rollback Plan
1. Keep previous deployment tagged in Git
2. Netlify: Use "Roll back to previous deploy" button
3. Render: Redeploy from previous commit
4. Have backup of environment variables
5. Keep database backups (if applicable)

### Support & Maintenance

#### Regular Checks (Weekly)
- [ ] Check application submissions
- [ ] Review dashboard for new applications
- [ ] Test Discord API connection
- [ ] Monitor error logs
- [ ] Check site performance

#### Updates (Monthly)
- [ ] Update dependencies (`npm update`)
- [ ] Security patches
- [ ] Review and improve based on user feedback
- [ ] Add new features from backlog

### Troubleshooting

#### Common Issues

**Issue: Discord stats not loading**
- Check Discord bot token is valid
- Verify guild ID is correct
- Ensure bot has proper permissions
- Check backend server is running

**Issue: Applications not saving**
- Check localStorage quota
- Verify form validation passing
- Check browser console for errors
- Test with different browsers

**Issue: Dashboard access denied**
- Verify email in authorized list
- Check email is lowercase
- Test OAuth flow
- Clear localStorage and re-login

**Issue: Styles not applying**
- Clear browser cache
- Check CSS files are loading
- Verify settings.js is loaded
- Test in incognito mode

### Success Metrics
- [ ] 0 console errors on any page
- [ ] Lighthouse score > 90
- [ ] Page load time < 2 seconds
- [ ] Mobile responsive score 100%
- [ ] Accessibility score > 95
- [ ] All forms functional
- [ ] All integrations working

## 🎉 Deployment Complete!

Once all checks pass:
1. Tag release in Git: `git tag v2.0.0`
2. Create release notes
3. Announce to team
4. Monitor for 24 hours
5. Celebrate! 🎊

---

**Last Updated**: November 1, 2025
**Version**: 2.0.0
**Status**: Ready for Production ✅
