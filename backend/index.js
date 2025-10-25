const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'https://zorn-website.netlify.app',
        'https://zorn-website.onrender.com',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Team Zorn Backend Services',
        version: '1.0.0',
        services: {
            'Discord Proxy': 'http://localhost:3001',
            'Contact Handler': 'http://localhost:3002', 
            'Application Handler': 'http://localhost:3003',
            'OAuth Handler': 'http://localhost:3004'
        },
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Health check for all services
app.get('/health', async (req, res) => {
    const services = [
        { name: 'Discord Proxy', url: 'http://localhost:3001/health' },
        { name: 'Contact Handler', url: 'http://localhost:3002/health' },
        { name: 'Application Handler', url: 'http://localhost:3003/health' },
        { name: 'OAuth Handler', url: 'http://localhost:3004/health' }
    ];

    const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
            try {
                const response = await fetch(service.url);
                const data = await response.json();
                return {
                    name: service.name,
                    status: response.ok ? 'healthy' : 'unhealthy',
                    data: data
                };
            } catch (error) {
                return {
                    name: service.name,
                    status: 'offline',
                    error: error.message
                };
            }
        })
    );

    const results = healthChecks.map(check => check.value || check.reason);
    const allHealthy = results.every(result => result.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
        overall_status: allHealthy ? 'healthy' : 'degraded',
        services: results,
        timestamp: new Date().toISOString()
    });
});

// Service proxy endpoints (optional - for single endpoint access)
app.use('/api/discord', (req, res) => {
    const proxyUrl = `http://localhost:3001${req.originalUrl.replace('/api/discord', '/api/discord')}`;
    // Simple redirect to Discord service
    res.redirect(307, proxyUrl);
});

app.use('/api/contact', (req, res) => {
    const proxyUrl = `http://localhost:3002${req.originalUrl.replace('/api/contact', '/api/contact')}`;
    res.redirect(307, proxyUrl);
});

app.use('/api/apply', (req, res) => {
    const proxyUrl = `http://localhost:3003${req.originalUrl.replace('/api/apply', '/api/apply')}`;
    res.redirect(307, proxyUrl);
});

// Documentation endpoint
app.get('/docs', (req, res) => {
    res.json({
        title: 'Team Zorn Backend API Documentation',
        version: '1.0.0',
        baseUrl: req.get('host'),
        endpoints: {
            'GET /': 'Service status and overview',
            'GET /health': 'Health check for all services',
            'GET /docs': 'This documentation',
            
            'Discord Service (Port 3001)': {
                'GET /api/discord/members': 'Get Discord server member count',
                'GET /api/discord/team': 'Get team members with specific role'
            },
            
            'Contact Service (Port 3002)': {
                'POST /api/contact': 'Submit contact form',
                'GET /health': 'Contact service health check'
            },
            
            'Application Service (Port 3003)': {
                'POST /api/apply/:type': 'Submit application (competitive, creator, editor, designer)',
                'GET /api/application/:id': 'Get application status',
                'GET /health': 'Application service health check'
            }
        },
        cors: {
            allowed_origins: corsOptions.origin
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'Check /docs for available endpoints'
    });
});

// OAuth routes - proxy to OAuth handler
app.use('/auth', (req, res) => {
    const oauthUrl = `http://localhost:3004${req.originalUrl}`;
    res.redirect(oauthUrl);
});

app.use('/api/auth', (req, res) => {
    const oauthUrl = `http://localhost:3004${req.originalUrl}`;
    
    // For API routes, we need to proxy the request properly
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(oauthUrl);
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: req.method,
        headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'OAuth service unavailable' });
    });
    
    req.pipe(proxyReq);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end'
    });
});

app.listen(port, () => {
    console.log(`🚀 Team Zorn Backend Coordinator running on port ${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/docs`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
    console.log('');
    console.log('Individual Services:');
    console.log(`🎮 Discord Proxy: http://localhost:3001`);
    console.log(`📧 Contact Handler: http://localhost:3002`);
    console.log(`📝 Application Handler: http://localhost:3003`);
    console.log(`🔐 OAuth Handler: http://localhost:3004`);
});

module.exports = app;