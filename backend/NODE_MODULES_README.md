# Node Modules Management

## For Deployment
node_modules folders have been removed from all backend services to make them deployment-friendly. The hosting services (Render, Netlify, etc.) will automatically install dependencies using package.json.

## For Local Development
If you need to run the backend services locally again, restore the dependencies:

### Quick Restore (Recommended)
```bash
# Restore from backup
cd "e:\Zorn Website 2.0\backend"
Move-Item "node_modules_backup\discord-proxy-node_modules" "discord-proxy\node_modules"
Move-Item "node_modules_backup\oauth-handler-node_modules" "oauth-handler\node_modules"
Move-Item "node_modules_backup\main-backend-node_modules" "node_modules"
```

### Fresh Install (Alternative)
```bash
# Discord Proxy
cd "e:\Zorn Website 2.0\backend\discord-proxy"
npm install

# OAuth Handler  
cd "e:\Zorn Website 2.0\backend\oauth-handler"
npm install

# Main Backend
cd "e:\Zorn Website 2.0\backend"
npm install
```

## Current Status
- ✅ discord-proxy: 6 files (deployment ready)
- ✅ oauth-handler: 7 files (deployment ready)
- ✅ .gitignore files added to prevent future node_modules commits
- ✅ node_modules backed up to `backend/node_modules_backup/`

## File Counts
- Before cleanup: 1,142+ files per service
- After cleanup: ~6-7 files per service
- Backup location: `e:\Zorn Website 2.0\backend\node_modules_backup\`