const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000', 
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://zorn-website.netlify.app',
        'https://zorn-website.onrender.com',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Discord API configuration from environment variables
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const MEMBER_ROLE_ID = process.env.DISCORD_MEMBER_ROLE_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Headers for Discord API
const discordHeaders = {
    'Authorization': `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json'
};

// Route to get Discord server member count
app.get('/api/discord/members', async (req, res) => {
    try {
        const response = await fetch(`${DISCORD_API_BASE}/guilds/${GUILD_ID}?with_counts=true`, {
            headers: discordHeaders
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({
            total_members: data.approximate_member_count,
            online_members: data.approximate_presence_count
        });
    } catch (error) {
        console.error('Error fetching Discord members:', error);
        res.status(500).json({ error: 'Failed to fetch Discord data' });
    }
});

// Route to get team members (with specific role)
app.get('/api/discord/team-members', async (req, res) => {
    try {
        const response = await fetch(`${DISCORD_API_BASE}/guilds/${GUILD_ID}/members?limit=1000`, {
            headers: discordHeaders
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        const members = await response.json();
        const teamMembers = members.filter(member => member.roles.includes(MEMBER_ROLE_ID));
        
        res.json({
            team_member_count: teamMembers.length
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team member data' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Discord proxy server is running' });
});

app.listen(port, () => {
    console.log(`🚀 Discord Proxy Server running at http://localhost:${port}`);
    console.log(`📊 Discord API endpoints:`);
    console.log(`   - GET /api/discord/members`);
    console.log(`   - GET /api/discord/team-members`);
    console.log(`   - GET /api/health`);
});