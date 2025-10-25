# Pre-Deployment Checklist ✅

Use this checklist before deploying your Zorn website to ensure everything is ready.

## 📋 File Structure Verification
- [ ] All HTML files are in root directory
- [ ] `assets/` folder contains `css/`, `js/`, `img/`, `fonts/`
- [ ] All images are optimized and in correct formats
- [ ] No broken internal links

## 🔧 Configuration Files
- [ ] `netlify.toml` - Netlify configuration
- [ ] `render.yaml` - Render configuration  
- [ ] `.github/workflows/deploy.yml` - GitHub Actions
- [ ] `package.json` - Project metadata
- [ ] `robots.txt` - SEO crawler instructions
- [ ] `sitemap.xml` - Site structure for search engines
- [ ] `404.html` - Custom error page
- [ ] `.gitignore` - Git ignore rules

## 🌐 URL Configuration
- [ ] Update repository URL in `package.json`
- [ ] Update site URLs in `sitemap.xml`
- [ ] Update domain in `robots.txt`
- [ ] Check all relative paths in HTML files

## 🚀 Platform-Specific Setup

### Netlify
- [ ] Repository connected to Netlify
- [ ] Build settings configured (auto-detected from `netlify.toml`)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled (auto)

### Render
- [ ] Repository connected to Render
- [ ] Service type set to "Static Site"
- [ ] Build configuration from `render.yaml`
- [ ] Custom domain configured (optional)

### GitHub Pages
- [ ] Repository settings → Pages → Source: "GitHub Actions"
- [ ] Workflow file in `.github/workflows/`
- [ ] Pages permissions enabled
- [ ] Custom domain in repository settings (optional)

## 🔍 Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works on all pages
- [ ] Mobile responsiveness tested
- [ ] Contact form functionality (if enabled)
- [ ] All images load properly
- [ ] JavaScript functionality works
- [ ] CSS animations work smoothly

## 📊 SEO & Performance
- [ ] Meta tags present on all pages
- [ ] Page titles are descriptive and unique
- [ ] Alt text on all images
- [ ] Sitemap submitted to search engines
- [ ] Google Analytics configured (optional)
- [ ] Performance tested (Lighthouse)

## 🔒 Security
- [ ] Security headers configured in hosting platform
- [ ] No sensitive data in repository
- [ ] HTTPS enforced on hosting platform
- [ ] Form submission endpoints secured

## 📱 Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox  
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Final Steps
- [ ] Test deployed site thoroughly
- [ ] Update any hardcoded URLs to production URLs  
- [ ] Monitor deployment logs for errors
- [ ] Set up monitoring/analytics (optional)

## 🚨 Emergency Rollback Plan
- [ ] Know how to rollback on each platform:
  - **Netlify**: Deployments → Previous deploy → Restore
  - **Render**: Deploys → Previous deploy → Redeploy
  - **GitHub Pages**: Repository → Revert commit → Push

---

## 📞 Platform Support Links
- [Netlify Status](https://www.netlifystatus.com/)
- [Render Status](https://status.render.com/)
- [GitHub Status](https://www.githubstatus.com/)

---

**✅ Once all items are checked, your website is ready for deployment!**

Remember to test the deployed site thoroughly before announcing it publicly.