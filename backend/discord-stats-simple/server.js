/**
 * Simple Discord Stats API
 * This is a lightweight, easy-to-deploy Discord stats endpoint
 * that fetches member and role counts without complex bot setup
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
// Configuration
const config = {
    discordBotToken: process.env.DISCORD_BOT_TOKEN || 'YOUR_DISCORD_BOT_TOKEN_HERE',
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1329264791704961034';
const DISCORD_MEMBER_ROLE_ID = process.env.DISCORD_MEMBER_ROLE_ID || '1376033872411627550';

// CORS configuration
app.use(cors({
    origin: ['https://zorn.team', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

app.use(express.json());

// Cache for stats (refresh every 5 minutes)
let statsCache = {
    data: null,
    lastUpdate: 0,
    ttl: 5 * 60 * 1000 // 5 minutes
};

/**
 * Fetch Discord server stats
 */
async function fetchDiscordStats() {
    try {
        // Check cache first
        const now = Date.now();
        if (statsCache.data && (now - statsCache.lastUpdate) < statsCache.ttl) {
            console.log('📊 Returning cached Discord stats');
            return statsCache.data;
        }

        console.log('🔄 Fetching fresh Discord stats...');
        
        // Fetch guild information
        const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!guildResponse.ok) {
            const errorText = await guildResponse.text();
            throw new Error(`Discord API error: ${guildResponse.status} - ${errorText}`);
        }

        const guildData = await guildResponse.json();
        
        // Fetch members with the specific role
        const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!membersResponse.ok) {
            throw new Error(`Failed to fetch members: ${membersResponse.status}`);
        }

        const membersData = await membersResponse.json();
        
        // Count members with specific role
        const teamMemberCount = membersData.filter(member => 
            member.roles.includes(DISCORD_MEMBER_ROLE_ID)
        ).length;

        const stats = {
            total_members: guildData.approximate_member_count || 0,
            online_members: guildData.approximate_presence_count || 0,
            team_member_count: teamMemberCount,
            last_updated: new Date().toISOString()
        };

        // Update cache
        statsCache.data = stats;
        statsCache.lastUpdate = now;

        console.log('✅ Discord stats fetched successfully:', stats);
        return stats;

    } catch (error) {
        console.error('❌ Error fetching Discord stats:', error.message);
        
        // Return cached data if available, or default values
        if (statsCache.data) {
            console.log('⚠️ Returning stale cached data due to error');
            return statsCache.data;
        }
        
        return {
            total_members: 0,
            online_members: 0,
            team_member_count: 0,
            last_updated: new Date().toISOString(),
            error: 'Failed to fetch stats'
        };
    }
}

/**
 * API endpoint for Discord member count
 */
app.get('/api/discord/members', async (req, res) => {
    try {
        const stats = await fetchDiscordStats();
        res.json(stats);
    } catch (error) {
        console.error('Error in /api/discord/members:', error);
        res.status(500).json({ 
            error: 'Failed to fetch Discord stats',
            total_members: 0,
            online_members: 0
        });
    }
});

/**
 * API endpoint for team member count
 */
app.get('/api/discord/team-members', async (req, res) => {
    try {
        const stats = await fetchDiscordStats();
        res.json({
            team_member_count: stats.team_member_count,
            last_updated: stats.last_updated
        });
    } catch (error) {
        console.error('Error in /api/discord/team-members:', error);
        res.status(500).json({ 
            error: 'Failed to fetch team member count',
            team_member_count: 0
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
    try {
        const stats = await fetchDiscordStats();
        res.json({ 
            status: 'healthy', 
            uptime: process.uptime(),
            stats_available: !!stats.total_members,
            last_stats_update: stats.last_updated
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy', 
            error: error.message 
        });
    }
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        service: 'Team Zorn Discord Stats API',
        version: '2.0',
        endpoints: {
            '/api/discord/members': 'Get Discord server member counts',
            '/api/discord/team-members': 'Get team member count (with specific role)',
            '/health': 'Health check'
        },
        documentation: 'Simple, reliable Discord stats API'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Discord Stats API running on port ${PORT}`);
    console.log(`📊 Guild ID: ${DISCORD_GUILD_ID}`);
    console.log(`🎯 Member Role ID: ${DISCORD_MEMBER_ROLE_ID}`);
    console.log(`⏰ Cache TTL: ${statsCache.ttl / 1000} seconds`);
    
    // Fetch initial stats
    fetchDiscordStats().then(() => {
        console.log('✅ Initial stats loaded successfully');
    }).catch(err => {
        console.error('❌ Failed to load initial stats:', err.message);
    });
});

module.exports = app;
