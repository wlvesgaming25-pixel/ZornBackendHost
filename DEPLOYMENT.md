# Deployment Guide - Zorn Website 2.0

This guide provides step-by-step instructions for deploying the Zorn website to Netlify, Render, and GitHub Pages.

## 📋 Prerequisites

- Git installed on your system
- GitHub account
- Netlify account (free)
- Render account (free)

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/zorn-website-2.0)

### Option 2: Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/zorn-website-2.0)

---

## 🌐 Netlify Deployment

### Method 1: Git-based Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Deploy Settings** (auto-configured)
   - Build command: `echo "Static site - no build needed"`
   - Publish directory: `.` (root)
   - Branch to deploy: `main`

### Method 2: Manual Deploy

1. **Drag & Drop**
   - Zip your project folder
   - Go to [Netlify](https://app.netlify.com)
   - Drag the zip file to the deploy area

### Custom Domain Setup
```toml
# Add to netlify.toml
[[redirects]]
  from = "https://old-domain.com/*"
  to = "https://zorn.gg/:splat"
  status = 301
  force = true
```

---

## 🔷 Render Deployment

### Method 1: Git-based Deployment

1. **Push to GitHub** (same as above)

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

3. **Configuration** (auto-detected from `render.yaml`)
   - Build command: `echo "No build needed"`
   - Publish directory: `.`
   - Auto-deploy: Yes

### Method 2: Manual Configuration

If `render.yaml` isn't detected:
```yaml
services:
  - type: web
    name: zorn-website
    env: static
    buildCommand: echo "Static site"
    staticPublishPath: .
```

---

## 🐙 GitHub Pages Deployment

### Method 1: GitHub Actions (Automated)

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"

2. **Push to Repository**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Automatic Deployment**
   - The `.github/workflows/deploy.yml` will trigger automatically
   - Site will be available at: `https://username.github.io/repository-name`

### Method 2: Manual Pages Setup

1. **Settings Configuration**
   - Repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`

---

## 🛠️ Local Development

```bash
# Install dependencies (optional)
npm install

# Start local server
npm run dev
# or
python -m http.server 8000

# Open browser
http://localhost:8000
```

---

## 🔧 Configuration Files Overview

### `netlify.toml`
- Redirect rules for clean URLs
- Security headers
- Cache optimization
- Build settings

### `render.yaml`
- Static site configuration
- Environment variables
- Custom domains
- Security headers

### `.github/workflows/deploy.yml`
- Automated GitHub Pages deployment
- Build validation
- Artifact upload

### `package.json`
- Project metadata
- Development scripts
- Deployment commands

---

## 🚨 Troubleshooting

### Common Issues

1. **404 Errors on Page Refresh**
   - Solution: Redirect rules in `netlify.toml` handle this
   - For GitHub Pages: Use hash routing or custom 404.html

2. **Assets Not Loading**
   - Check relative paths in HTML files
   - Ensure `assets/` folder is committed to git

3. **Build Failures**
   - This is a static site - no build process required
   - Check for any syntax errors in HTML/CSS

### Build Commands by Platform

| Platform | Build Command | Publish Directory |
|----------|---------------|-------------------|
| Netlify  | `echo "Static site"` | `.` (root) |
| Render   | `echo "Static site"` | `.` (root) |
| GitHub   | None required | `.` (root) |

---

## 🎯 Performance Optimization

### Pre-deployment Checklist
- [ ] Optimize images (use WebP where possible)
- [ ] Minify CSS and JavaScript
- [ ] Test on multiple devices and browsers
- [ ] Validate HTML markup
- [ ] Check accessibility compliance
- [ ] Test loading speed

### Cache Headers (Configured)
- Static assets: 1 year cache
- HTML files: No cache (for updates)
- Images: 1 year cache

---

## 🌍 Custom Domains

### Netlify Custom Domain
1. Domain settings in Netlify dashboard
2. Add DNS records from your domain provider
3. SSL certificate auto-generated

### Render Custom Domain
1. Add domain in Render dashboard
2. Update DNS records
3. SSL certificate auto-generated

### GitHub Pages Custom Domain
1. Add `CNAME` file to repository root
2. Configure DNS with your domain provider
3. Enable HTTPS in repository settings

---

## 📊 Monitoring & Analytics

### Recommended Services
- **Netlify Analytics** (built-in)
- **Google Analytics** (add to HTML)
- **Render Metrics** (dashboard)
- **GitHub Insights** (repository stats)

---

## 🔄 Continuous Deployment

All platforms support automatic deployment:
- **Trigger**: Push to `main` branch
- **Process**: Platform detects changes and redeploys
- **Time**: Usually 1-3 minutes for static sites

---

## 📞 Support Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)

---

**Ready to deploy? Choose your platform and follow the guide above!** 🚀