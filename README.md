# Zorn Website 2.0

A modern, responsive website built for multiple hosting platforms including Netlify, Render, and GitHub Pages.

## 🚀 Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/zorn-website-2.0)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/zorn-website-2.0)

## ✨ Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Multi-page Structure**: Home, About, Apply, Contact, Partners, Roster, and Store pages
- **Modern UI/UX**: Clean design with smooth animations and transitions
- **SEO Optimized**: Proper meta tags, semantic HTML, structured data, and sitemap
- **Performance Optimized**: Compressed images, minified CSS, and efficient loading
- **Cross-browser Compatible**: Works on all modern browsers
- **Accessibility Focused**: ARIA labels, keyboard navigation, and screen reader support
- **Backend Integration**: Full Node.js backend system with Discord API, contact forms, and applications
- **Multi-platform Hosting**: Ready for Netlify, Render, and GitHub Pages
- **Automated Deployment**: GitHub Actions workflow included

## 📁 Project Structure

```
zorn-website-2.0/
├── index.html              # Homepage
├── about.html              # About page
├── apply.html              # Application page
├── contact.html            # Contact page
├── partners.html           # Partners page
├── roster.html             # Team roster page
├── store.html              # Store/merchandise page
├── netlify.toml            # Netlify configuration
├── render.yaml             # Render configuration
├── .gitignore             # Git ignore rules
└── assets/
    ├── css/               # Stylesheets
    │   ├── index.css      # Homepage styles
    │   ├── about.css      # About page styles
    │   ├── apply.css      # Application page styles
    │   ├── contact.css    # Contact page styles
    │   ├── partners.css   # Partners page styles
    │   ├── roster.css     # Roster page styles
    │   └── store.css      # Store page styles
    ├── js/                # JavaScript files
    │   ├── main.js        # Main functionality
    │   ├── roster.js      # Roster filtering
    │   └── store.js       # Store functionality
    ├── img/               # Images and graphics
    │   ├── logo.png       # Site logo
    │   ├── hero-image.jpg # Homepage hero
    │   ├── roster/        # Team member photos
    │   ├── store/         # Product images
    │   └── partners/      # Partner logos
    └── fonts/             # Custom fonts
```

## 🌐 Deployment

This website is configured for deployment on multiple platforms:

### Netlify
1. Connect your GitHub repository to Netlify
2. The `netlify.toml` file contains all necessary configuration
3. Automatic deployments on push to main branch

### Render
1. Connect your GitHub repository to Render
2. The `render.yaml` file contains deployment configuration
3. Automatic deployments on push to main branch

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to root directory
3. Site will be available at `username.github.io/repository-name`

### Vercel
1. Import project from GitHub
2. No additional configuration needed
3. Automatic deployments on push

## � Deployment

### Frontend (Static Website)

#### One-Click Deployment
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/zorn-website-2.0)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/zorn-website-2.0)

#### Manual Steps
1. Fork this repository
2. Choose your platform (Netlify/Render/GitHub Pages)  
3. Connect your GitHub account
4. Deploy automatically

### Backend Services

The website includes a complete backend system:
- **Discord Integration** (member count, server stats)
- **Contact Form Processing** (email handling)
- **Application System** (team recruitment with file uploads)

#### Quick Backend Setup
1. **Navigate to backend**: `cd backend`
2. **Deploy each service** on Render/Railway/Heroku
3. **Configure environment variables** (Discord tokens, email credentials)
4. **Update frontend URLs** in JavaScript files

📖 **Complete Backend Guide**: See [backend/README.md](backend/README.md)

### Manual Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on all hosting platforms.

## �🛠️ Development

### Prerequisites
- A modern web browser
- Text editor or IDE
- Git (for version control)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/zorn-website-2.0.git
   ```

2. Navigate to the project directory:
   ```bash
   cd zorn-website-2.0
   ```

3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. Visit `http://localhost:8000` to view the site

### Making Changes
1. Edit HTML files for content changes
2. Modify CSS files in `assets/css/` for styling
3. Update JavaScript files in `assets/js/` for functionality
4. Replace images in `assets/img/` as needed

## 📱 Pages Overview

- **Home (`index.html`)**: Landing page with hero section and key features
- **About (`about.html`)**: Company information, mission, and team overview
- **Apply (`apply.html`)**: Job application form with requirements
- **Contact (`contact.html`)**: Contact information and contact form
- **Partners (`partners.html`)**: Partner showcase with categories
- **Roster (`roster.html`)**: Team member profiles with filtering
- **Store (`store.html`)**: E-commerce page with product catalog

## 🎨 Design System

### Colors
- Primary: `#007bff` (Blue)
- Secondary: `#6c757d` (Gray)
- Success: `#28a745` (Green)
- Info: `#17a2b8` (Cyan)
- Warning: `#ffc107` (Yellow)
- Danger: `#dc3545` (Red)

### Typography
- Primary Font: Inter (Google Fonts)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Breakpoints
- Mobile: `<768px`
- Tablet: `768px - 1024px`
- Desktop: `>1024px`

## 🔧 Configuration

### Forms
Forms are configured to work with:
- Netlify Forms (automatic handling)
- Formspree (third-party service)
- Custom backend integration

### Analytics
Ready for integration with:
- Google Analytics 4
- Plausible Analytics
- Fathom Analytics

### SEO
- Meta tags optimized for social sharing
- Structured data markup ready
- Sitemap generation ready

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@zorn.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/zorn-website-2.0/issues)

## 🔄 Updates

Keep track of updates and new features in the [CHANGELOG.md](CHANGELOG.md) file.

---

Built with ❤️ by the Zorn team