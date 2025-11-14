# 🚀 Dashboard to Roster Integration Guide

## Overview

The Zorn Website features an automatic integration system that connects the Dashboard and Roster pages. When an application is **accepted** on the dashboard, the applicant automatically appears on the roster page under their appropriate position section.

## How It Works

### Flow Diagram
```
Application Submitted
    ↓
Dashboard Review
    ↓
Admin Clicks "Accept"
    ↓
[dashboard.js] Dispatches 'applicationAccepted' Event
    ↓
[roster-integration.js] Receives Event
    ↓
Transform Application → Roster Member
    ↓
Save to localStorage
    ↓
[roster-enhanced.js] Reads localStorage
    ↓
Member Appears on Roster Page ✨
```

## Files Involved

### 1. `assets/js/dashboard.js`
**Purpose**: Dispatch acceptance event

**Key Code**:
```javascript
// In executeConfirmedAction() function
if (action === 'accept') {
    window.dispatchEvent(new CustomEvent('applicationAccepted', {
        detail: this.applications[appIndex]
    }));
}
```

### 2. `assets/js/roster-integration.js`
**Purpose**: Transform application data and save to storage

**Key Features**:
- `transformApplicationToMember()` - Converts application format to roster member format
- `normalizePosition()` - Maps role names (freestyler, competitive, etc.) to display categories
- `extractSocials()` - Extracts social media links from text
- `getCountryFlag()` - Returns emoji flags for countries
- `getRosterMembers()` / `saveRosterMembers()` - localStorage management

**Transformation Example**:
```javascript
// Input (Application)
{
    name: "John Doe",
    role: "freestyler",
    email: "john@example.com",
    discordTag: "JohnDoe#1234",
    socials: "Twitter: https://twitter.com/johndoe",
    country: "United States"
}

// Output (Roster Member)
{
    id: "member_1234567890",
    name: "John Doe",
    position: "Freestyler",
    country: "United States",
    countryFlag: "🇺🇸",
    socials: {
        twitter: "https://twitter.com/johndoe"
    },
    joinedDate: "2025-01-15T10:30:00.000Z",
    status: "active",
    addedFrom: "dashboard",
    applicationId: "app_xyz123"
}
```

### 3. `assets/js/roster-enhanced.js`
**Purpose**: Display roster members from localStorage

**Key Features**:
- Reads `zornRosterMembers` from localStorage
- Groups members by position
- Creates member cards with avatars, flags, and social links
- Displays "New" badge for recently added members
- Auto-refreshes when roster updated

### 4. `roster.html`
**Purpose**: Display the roster

**Required Scripts** (in order):
```html
<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/settings.js"></script>
<script src="assets/js/animations.js"></script>
<script src="assets/js/roster-enhanced.js"></script>
<script src="assets/js/roster.js"></script>
```

## Position Mapping

The integration automatically maps application roles to roster positions:

| Application Role | Roster Position |
|-----------------|-----------------|
| freestyler | Freestyler |
| competitive | Competitive |
| content-creator | Content Creator |
| editor | Editor |
| designer | Designer |
| management | Management |
| coach | Coach |
| other | Other |

## Social Media Extraction

The system automatically extracts social media links from the application's social field:

**Supported Platforms**:
- Twitter/X
- YouTube
- Twitch
- TikTok
- Instagram
- Discord

**Format Examples**:
```
Twitter: https://twitter.com/username
YouTube: https://youtube.com/@channel
Twitch: https://twitch.tv/streamer
TikTok: https://tiktok.com/@user
Instagram: https://instagram.com/profile
Discord: https://discord.gg/server
```

The system uses regex patterns to extract links regardless of formatting.

## Country Flags

The system maps country names to emoji flags:

**Supported Countries** (25+):
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇦🇺 Australia
- 🇩🇪 Germany
- 🇫🇷 France
- 🇪🇸 Spain
- 🇮🇹 Italy
- 🇯🇵 Japan
- 🇧🇷 Brazil
- 🇲🇽 Mexico
- 🇮🇳 India
- And more...

Default: 🌍 (if country not found)

## localStorage Structure

**Key**: `zornRosterMembers`

**Value**: JSON array of member objects

**Example**:
```json
[
    {
        "id": "member_1705329600000",
        "name": "John Doe",
        "position": "Freestyler",
        "country": "United States",
        "countryFlag": "🇺🇸",
        "socials": {
            "twitter": "https://twitter.com/johndoe",
            "twitch": "https://twitch.tv/johndoe"
        },
        "joinedDate": "2025-01-15T10:00:00.000Z",
        "status": "active",
        "addedFrom": "dashboard",
        "applicationId": "app_xyz123"
    }
]
```

## Testing the Integration

### Using the Test Page

1. Open `test-roster-integration.html` in your browser
2. Click "Accept Test Application" to simulate accepting an application
3. Click "View All Members" to see the saved data
4. Visit `roster.html` to see the member displayed

### Manual Testing

1. Go to the Dashboard (`dashboard.html`)
2. Find a pending application
3. Click "Accept"
4. Confirm the action
5. Visit the Roster page (`roster.html`)
6. Look for the new member under their position section
7. Verify:
   - Name is correct
   - Country flag displays
   - Social media icons appear
   - "New" badge is visible

## Member Card Features

### Visual Elements
- **Avatar Placeholder**: Shows initials in gradient background (if no image)
- **Country Flag**: Large emoji flag in top-right
- **Name**: Bold display name
- **Position**: Role/position text
- **Social Icons**: Clickable icons for each platform
- **New Badge**: Green badge with pulse animation

### Styling
- Card has slide-in animation on load
- Hover effects on social icons
- Gradient backgrounds matching site theme
- Responsive grid layout

## Troubleshooting

### Member not appearing on roster?
1. Check browser console for errors
2. Verify localStorage: Open DevTools → Application → Local Storage → `zornRosterMembers`
3. Ensure `roster-enhanced.js` is loaded before `roster.js`
4. Check that member's position matches a roster section

### Social icons not showing?
1. Verify social media links are in correct format
2. Check that platform is supported (Twitter, YouTube, Twitch, TikTok, Instagram, Discord)
3. Ensure icon images exist in `assets/img/roster/sociallogos/`

### Wrong country flag?
1. Check country name spelling in application
2. Verify country is in the supported list (see `getCountryFlag()` in `roster-integration.js`)
3. Default 🌍 shows if country not found

### Duplicate members?
1. Each acceptance creates a new member
2. Clear localStorage to reset: `localStorage.removeItem('zornRosterMembers')`
3. Or use the test page's "Clear All Members" button

## Advanced Customization

### Add New Social Platform

1. Edit `roster-integration.js`:
```javascript
extractSocials(socialText) {
    // Add new regex pattern
    const newPlatformMatch = socialText.match(/NewPlatform:\s*(https?:\/\/[^\s]+)/i);
    if (newPlatformMatch) {
        socials.newplatform = newPlatformMatch[1];
    }
}
```

2. Edit `roster-enhanced.js`:
```javascript
renderSocials(socials) {
    const socialIcons = {
        // Add new icon
        newplatform: 'newplatform-logo.png'
    };
}
```

3. Add icon image to `assets/img/roster/sociallogos/`

### Add New Country

Edit `roster-integration.js`:
```javascript
getCountryFlag(country) {
    const flagMap = {
        // Add new country
        'New Country': '🏳️',
    };
}
```

### Modify Member Card Layout

Edit `roster-enhanced.js` → `createMemberCard()` method to change HTML structure.

Edit `assets/css/roster.css` → `.member-card-new` styles to change appearance.

## Events Reference

### applicationAccepted
**Dispatched by**: `dashboard.js`  
**Listened by**: `roster-integration.js`  
**Data**: Full application object

```javascript
new CustomEvent('applicationAccepted', {
    detail: {
        id: string,
        name: string,
        email: string,
        role: string,
        discordTag: string,
        socials: string,
        country: string,
        timestamp: string
    }
});
```

### rosterUpdated
**Dispatched by**: `roster-integration.js`  
**Listened by**: `roster-enhanced.js`  
**Data**: None

```javascript
new CustomEvent('rosterUpdated', { detail: null });
```

## Browser Compatibility

- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported

**Requirements**:
- localStorage support
- CustomEvent API
- ES6+ JavaScript

## Performance

- **localStorage**: Instant read/write operations
- **Event dispatch**: Synchronous, no delay
- **Member cards**: Lazy loaded with scroll animations
- **Caching**: Members cached in localStorage, no API calls needed

## Security

- **XSS Protection**: All user input is escaped using `escapeHtml()`
- **localStorage**: Client-side only, no sensitive data
- **Links**: All social links open in new tab with `rel="noopener noreferrer"`

## Future Enhancements

Possible improvements:
- [ ] Backend API for persistent storage
- [ ] Member editing/removal from roster
- [ ] Profile pictures upload
- [ ] Member statistics and achievements
- [ ] Search and filter functionality
- [ ] Export roster to PDF/Excel
- [ ] Member activity tracking

---

**Integration Status**: ✅ Fully Functional  
**Last Updated**: January 2025  
**Version**: 1.0.0
