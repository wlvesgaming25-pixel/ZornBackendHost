@echo off
echo Starting Discord Proxy Service...
echo.
echo Make sure you have your .env file configured with:
echo - DISCORD_BOT_TOKEN
echo - DISCORD_GUILD_ID  
echo - DISCORD_MEMBER_ROLE_ID
echo.
cd /d "e:\Zorn Website 2.0\backend\discord-proxy"
echo Installing dependencies...
npm install
echo.
echo Starting server on port 3001...
node server.js