# Team Zorn Backend Services

A comprehensive backend system for the Team Zorn website, providing Discord integration, contact form handling, and application processing.

## 🏗️ Architecture

```
backend/
├── index.js                    # Main coordinator service
├── package.json               # Main backend dependencies
├── .env.example               # Environment template
│
├── discord-proxy/             # Discord API integration
│   ├── server.js             # Discord proxy server
│   ├── package.json          # Discord service dependencies
│   └── .env.example          # Discord environment template
│
├── contact-handler/           # Contact form processing
│   ├── server.js             # Contact form server
│   ├── package.json          # Contact service dependencies
│   └── .env.example          # Contact environment template
│
└── application-handler/       # Application form processing
    ├── server.js             # Application processing server
    ├── package.json          # Application service dependencies
    └── .env.example          # Application environment template
```

## 🚀 Services Overview

### 1. Main Coordinator (Port 3000)
- **Purpose**: Service orchestration and health monitoring
- **Features**: API documentation, health checks, service status
- **Endpoints**: `/`, `/health`, `/docs`

### 2. Discord Proxy (Port 3001)
- **Purpose**: Discord API integration for member counts and team data
- **Features**: Server statistics, member role filtering
- **Endpoints**: `/api/discord/members`, `/api/discord/team`

### 3. Contact Handler (Port 3002)
- **Purpose**: Contact form submission and email handling
- **Features**: Rate limiting, email validation, auto-replies
- **Endpoints**: `/api/contact`

### 4. Application Handler (Port 3003)
- **Purpose**: Team application processing with file uploads
- **Features**: Multi-type applications, file attachments, email notifications
- **Endpoints**: `/api/apply/:type`, `/api/application/:id`

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Gmail account for email services
- Discord bot token (for Discord integration)

### 1. Install All Dependencies
```bash
cd backend
npm run install-all
```

### 2. Environment Configuration
Create `.env` files in each service directory:

```bash
# Main backend
cp .env.example .env

# Discord service
cp discord-proxy/.env.example discord-proxy/.env

# Contact service  
cp contact-handler/.env.example contact-handler/.env

# Application service
cp application-handler/.env.example application-handler/.env
```

### 3. Configure Environment Variables

#### Discord Service (`discord-proxy/.env`)
```env
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
DISCORD_MEMBER_ROLE_ID=your-member-role-id
```

#### Contact Service (`contact-handler/.env`)
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password
CONTACT_EMAIL=contact@teamzorn.com
```

#### Application Service (`application-handler/.env`)
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password
APPLICATIONS_EMAIL=applications@teamzorn.com
```

## 🚀 Running the Services

### Development Mode (All Services)
```bash
npm run dev
```

### Production Mode (All Services)
```bash
npm start
```

### Individual Services
```bash
# Discord service only
npm run dev:discord

# Contact service only  
npm run dev:contact

# Application service only
npm run dev:applications
```

## 📡 API Endpoints

### Discord Integration
```http
GET /api/discord/members
# Returns: { total_members: 150, online_members: 45 }

GET /api/discord/team  
# Returns: Array of team members with role
```

### Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "subject": "General Inquiry",
  "message": "Hello Team Zorn..."
}
```

### Applications
```http
POST /api/apply/competitive
Content-Type: multipart/form-data

# Form fields + file attachments
# Supported types: competitive, creator, editor, designer
```

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Joi schema validation for all inputs
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Whitelisted origins only
- **Helmet**: Security headers for all services
- **Email Security**: HTML email templates with validation

## 🌐 Frontend Integration

Update your frontend JavaScript to use the backend:

```javascript
// Discord member count
const response = await fetch('http://localhost:3001/api/discord/members');
const { total_members, online_members } = await response.json();

// Contact form submission
const contactData = { name, email, subject, message };
const response = await fetch('http://localhost:3002/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
});

// Application submission
const formData = new FormData();
formData.append('name', name);
formData.append('email', email);
// ... other fields
formData.append('files', fileInput.files[0]);

const response = await fetch('http://localhost:3003/api/apply/competitive', {
    method: 'POST',
    body: formData
});
```

## 🚀 Deployment Options

### Option 1: Render (Recommended)
1. Connect your GitHub repository
2. Create separate services for each backend component
3. Set environment variables in Render dashboard
4. Deploy with auto-deploy enabled

### Option 2: Railway
1. Connect repository to Railway
2. Create services for each component
3. Configure environment variables
4. Deploy with custom domains

### Option 3: DigitalOcean App Platform
1. Create app from GitHub repository
2. Configure each service component
3. Set environment variables
4. Deploy with managed database options

### Option 4: Heroku
1. Create separate Heroku apps for each service
2. Configure buildpacks and environment variables
3. Use Heroku Postgres for application storage (optional)

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```http
GET /health
# Returns status of all services
```

### Service Status
```http  
GET /
# Returns overview of all backend services
```

### Logs Monitoring
- Each service logs to console
- Use PM2 or similar for production log management
- Set up log aggregation for production deployments

## 🔧 Configuration

### Email Setup (Gmail)
1. Enable 2-factor authentication on Gmail
2. Generate an App Password: Account → Security → App Passwords
3. Use the app password in `EMAIL_APP_PASSWORD`

### Discord Bot Setup
1. Create Discord application at https://discord.com/developers/applications
2. Create bot and copy token
3. Invite bot to your server with appropriate permissions
4. Get server ID and role IDs from Discord developer mode

## 📝 Development Notes

### Adding New Services
1. Create new directory in `/backend/`
2. Add service scripts to main `package.json`
3. Update coordinator health checks
4. Add documentation

### Database Integration
- MongoDB ready (uncomment Mongoose in application handler)
- PostgreSQL compatible with minor modifications
- SQLite for development/testing

### File Storage
- Currently uses memory storage (development)
- Add AWS S3 or Cloudinary for production file uploads
- Configure in multer settings

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check frontend URL in CORS configuration
   - Verify environment variables are loaded

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check less secure app access (if using regular password)
   - Verify SMTP settings for non-Gmail providers

3. **Discord API Errors**
   - Verify bot token is valid and bot is in server
   - Check bot permissions for reading members
   - Verify guild ID and role ID are correct

4. **File Upload Issues**
   - Check file size limits (5MB default)
   - Verify allowed file types
   - Ensure multer is properly configured

### Port Conflicts
If ports are in use, update in respective `.env` files:
```env
# Change default ports
PORT=3001  # Discord service
PORT=3002  # Contact service  
PORT=3003  # Application service
```

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Email service tested and working
- [ ] Discord integration verified
- [ ] Rate limiting configured appropriately
- [ ] File upload limits set correctly
- [ ] CORS origins updated for production URLs
- [ ] Health checks passing
- [ ] Error logging configured
- [ ] SSL/HTTPS enabled on deployment platform

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify environment configuration
3. Check service logs for detailed error messages
4. Ensure all dependencies are installed correctly

---

**🚀 Your backend services are now ready to power the Team Zorn website!**