# Team Zorn Discord Stats API (Simplified)

A lightweight, easy-to-deploy Discord stats service that provides real-time member and role counts.

## Features
- ✅ Simple Discord member count API
- ✅ Team member count (filtered by role)
- ✅ Built-in caching (5-minute TTL)
- ✅ CORS configured for zorn.team
- ✅ Health check endpoint
- ✅ Error handling and fallbacks

## Quick Setup

### 1. Install Dependencies
```bash
cd backend/discord-stats-simple
npm install
```

### 2. Set Environment Variables
Create a `.env` file or set these in your hosting platform:

```
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_MEMBER_ROLE_ID=your_role_id_here
PORT=3001
```

### 3. Run Locally
```bash
npm start
```

### 4. Deploy to Render.com

1. Go to https://render.com
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set these configurations:
   - **Name:** `zorn-discord-stats`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend/discord-stats-simple`

5. Add environment variables:
   - `DISCORD_BOT_TOKEN`: Your Discord bot token
   - `DISCORD_GUILD_ID`: 1329264791704961034
   - `DISCORD_MEMBER_ROLE_ID`: 1376033872411627550

6. Click "Create Web Service"

### 5. Update Frontend Config

Once deployed, update `assets/js/config.js` with your new Render URL:

```javascript
production: {
    discord: 'https://zorn-discord-stats.onrender.com',  // Your new service URL
    ...
}
```

## API Endpoints

### Get Discord Members
```
GET /api/discord/members
```
Response:
```json
{
  "total_members": 150,
  "online_members": 45,
  "team_member_count": 12,
  "last_updated": "2025-11-01T12:00:00.000Z"
}
```

### Get Team Members
```
GET /api/discord/team-members
```
Response:
```json
{
  "team_member_count": 12,
  "last_updated": "2025-11-01T12:00:00.000Z"
}
```

### Health Check
```
GET /health
```

## How It Works

1. **Caching:** Stats are cached for 5 minutes to avoid rate limits
2. **Discord API:** Uses Discord's REST API with your bot token
3. **Role Filtering:** Counts members with the specified role ID
4. **Error Handling:** Returns cached data or zeros if API fails

## Advantages Over Old System

- ✅ **Simpler:** Single file, no complex bot setup
- ✅ **Reliable:** Direct Discord API calls with caching
- ✅ **Fast:** Cached responses, no database needed
- ✅ **Easy to Deploy:** Works on any Node.js hosting (Render, Heroku, etc.)
- ✅ **No External Dependencies:** Just Discord API

## Troubleshooting

### Stats show 0
- Check your `DISCORD_BOT_TOKEN` is correct
- Verify your bot is in the server (guild)
- Check bot has `Server Members Intent` enabled in Discord Developer Portal

### CORS errors
- Verify `zorn.team` is in the CORS origins list
- If using a different domain, add it to the `cors()` configuration

### Rate limiting
- Increase the cache TTL in `server.js` (default: 5 minutes)
- Discord allows 50 requests per second, so this shouldn't be an issue

## Support
For issues, contact: teamzornhq@gmail.com
