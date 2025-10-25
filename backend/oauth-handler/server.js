const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://zorn.team'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Max 20 auth requests per 15 minutes per IP
    message: { error: 'Too many authentication attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Helper functions
const generateJWT = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            avatar: user.avatar,
            provider: user.provider,
            createdAt: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Discord OAuth URLs and functions
const getDiscordAuthURL = () => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email'
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
};

const getDiscordUser = async (accessToken) => {
    const response = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
};

const getDiscordToken = async (code) => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
    });

    const response = await axios.post('https://discord.com/api/oauth2/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return response.data.access_token;
};

// Google OAuth - REMOVED (Discord only implementation)

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'OAuth Handler', 
        timestamp: new Date().toISOString() 
    });
});

// Get current user info from JWT token
app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const user = verifyJWT(token);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    res.json({ success: true, user });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Discord OAuth routes
app.get('/auth/discord', authLimiter, (req, res) => {
    const authURL = getDiscordAuthURL();
    res.redirect(authURL);
});

app.get('/auth/discord/callback', authLimiter, async (req, res) => {
    try {
        const { code, error } = req.query;

        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=discord_auth_failed`);
        }

        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        // Exchange code for access token
        const accessToken = await getDiscordToken(code);
        
        // Get user info
        const discordUser = await getDiscordUser(accessToken);
        
        // Create user object
        const user = {
            id: `discord_${discordUser.id}`,
            username: discordUser.username,
            email: discordUser.email,
            avatar: discordUser.avatar ? 
                `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : 
                null,
            provider: 'discord',
            providerId: discordUser.id
        };

        // Generate JWT
        const token = generateJWT(user);

        // Set secure cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success.html?success=discord_login`);

    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=discord_auth_failed`);
    }
});

// Google OAuth routes - REMOVED (Discord only implementation)

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

app.listen(port, () => {
    console.log(`OAuth handler running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Discord OAuth configured:', !!process.env.DISCORD_CLIENT_ID);
    console.log('Google OAuth: DISABLED (Discord only)');
});

module.exports = app;