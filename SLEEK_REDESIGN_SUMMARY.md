# Sleek Minimal Website Redesign

## Overview
The website has been redesigned with a sleek, minimal aesthetic while maintaining the **exact same color scheme**:
- Primary Gradient: `#ff4824` to `#ff0b4e`
- Background: `#0a0a0a` (pure black)
- Secondary Background: `#111` and `#1a1a1a`
- Text Primary: `#e0e0e0`
- Text Secondary: `#b0b0b0` and `#888`

## Key Design Changes

### 1. **Removed Rounded Corners**
   - Changed from `border-radius: 12px-25px` to minimal values (`0-4px`)
   - Creates sharper, more professional look
   - Less "friendly", more "sleek and minimal"

### 2. **Updated Typography**
   - Tighter letter-spacing (`-0.02em` to `-0.03em` for headings)
   - Increased font weights (700-800 for headings)
   - Uppercase text with wider letter-spacing (`0.1em`) for navigation and labels
   - Reduced line-height for cleaner look

### 3. **Simplified Backgrounds**
   - Changed from solid colors to `rgba(255, 255, 255, 0.02)` - subtle transparency
   - Added minimal grid pattern background on body
   - Removed heavy gradients and radial glows
   - Cleaner, flatter aesthetic

### 4. **Refined Borders**
   - Changed from `border: 1px solid #333` to `border: 1px solid rgba(255, 255, 255, 0.05)`
   - More subtle, blends better with background
   - Added accent top borders with gradient that reveal on hover

### 5. **Minimal Hover Effects**
   - Reduced transform values (from `-8px` to `-4px` or `-6px`)
   - Subtler shadows
   - Linear transitions instead of cubic-bezier curves
   - Cleaner, less "playful" animations

### 6. **Geometric Accents**
   - Added thin vertical/horizontal lines as visual guides
   - Minimal geometric corner decorations
   - Clean dividers using gradient lines

### 7. **Updated Spacing**
   - Increased whitespace between sections
   - More breathing room in cards
   - Better use of negative space

### 8. **Navigation**
   - Minimalist nav with uppercase text
   - Thin underline on hover instead of background color
   - Reduced backdrop blur for cleaner look
   - Smaller logo and icons

## Files Updated

### ✅ Completed
1. **sleek-design.css** - New design system with variables and utilities
2. **index.css** - Homepage redesigned with minimal aesthetic
3. **about.css** - About page with cleaner cards and layouts

### 🔄 Recommended Updates
4. **roster.css** - Apply minimal card design to team members
5. **apply.css** - Clean form inputs and minimal buttons
6. **contact.css** - Simplified contact form
7. **partners.css** - Minimal partner grid layout
8. **store.css** - Clean product cards

## Color Scheme (UNCHANGED)
```css
--primary-gradient-start: #ff4824;
--primary-gradient-end: #ff0b4e;
--bg-primary: #0a0a0a;
--bg-secondary: #111;
--bg-card: #1a1a1a;
--text-primary: #e0e0e0;
--text-secondary: #b0b0b0;
--text-muted: #888;
--border-color: #333;
--border-subtle: #222;
```

## Design Principles

1. **Less is More** - Removed unnecessary decorations
2. **Sharp & Precise** - Geometric shapes, minimal rounding
3. **Subtle Interactions** - Hover effects are present but refined
4. **Breathing Room** - More whitespace, less clutter
5. **Typography First** - Let content breathe
6. **Consistent Spacing** - Using CSS variables for uniformity

## Next Steps

To complete the redesign:
1. Update remaining CSS files (roster, apply, contact, partners, store)
2. Test responsive layouts on mobile devices
3. Verify all animations are smooth
4. Ensure accessibility is maintained
5. Test cross-browser compatibility

## Usage

Include the sleek design system in your HTML:
```html
<link rel="stylesheet" href="assets/css/sleek-design.css">
<link rel="stylesheet" href="assets/css/index.css">
```

Use utility classes for quick styling:
```html
<div class="sleek-card sleek-hover-lift">
    <h3 class="gradient-text">Title</h3>
    <p class="sleek-body">Content</p>
</div>
```
