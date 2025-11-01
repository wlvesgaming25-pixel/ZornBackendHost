// Settings Management System
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            theme: 'dark',
            fontSize: 100,
            highContrast: false,
            reduceMotion: false,
            dyslexiaFont: false,
            letterSpacing: 0,
            lineHeight: 1.6,
            focusIndicators: false,
            backgroundEffects: true,
            smoothScroll: true
        };

        this.settings = this.loadSettings();
        this.init();
    }

    // Initialize settings
    init() {
        this.applySettings();
        this.attachEventListeners();
        this.updateUI();
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('zornSettings');
            if (saved) {
                return { ...this.defaultSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return { ...this.defaultSettings };
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('zornSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Apply all settings to the page
    applySettings() {
        // Theme
        this.applyTheme(this.settings.theme);

        // Font Size
        document.documentElement.style.fontSize = `${this.settings.fontSize}%`;

        // High Contrast
        document.body.classList.toggle('high-contrast', this.settings.highContrast);

        // Reduce Motion
        document.body.classList.toggle('reduce-motion', this.settings.reduceMotion);

        // Dyslexia Font
        document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);

        // Letter Spacing
        document.body.style.letterSpacing = `${this.settings.letterSpacing}px`;

        // Line Height
        document.body.style.lineHeight = this.settings.lineHeight;

        // Focus Indicators
        document.body.classList.toggle('enhanced-focus', this.settings.focusIndicators);

        // Smooth Scroll
        document.documentElement.classList.toggle('smooth-scroll', this.settings.smoothScroll);

        // Background Effects (could be used for particles, etc.)
        if (!this.settings.backgroundEffects) {
            // Disable any background effects if implemented
            document.querySelectorAll('.background-effect').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    // Apply theme
    applyTheme(theme) {
        if (theme === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('light-mode', !prefersDark);
        } else {
            document.body.classList.toggle('light-mode', theme === 'light');
        }
    }

    // Update UI controls to match current settings
    updateUI() {
        // Theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = this.settings.theme;

        // Font Size
        const fontSizeRange = document.getElementById('fontSizeRange');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeRange) {
            fontSizeRange.value = this.settings.fontSize;
            if (fontSizeValue) fontSizeValue.textContent = `${this.settings.fontSize}%`;
        }

        // High Contrast
        const highContrastToggle = document.getElementById('highContrastToggle');
        if (highContrastToggle) highContrastToggle.checked = this.settings.highContrast;

        // Reduce Motion
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        if (reduceMotionToggle) reduceMotionToggle.checked = this.settings.reduceMotion;

        // Dyslexia Font
        const dyslexiaFontToggle = document.getElementById('dyslexiaFontToggle');
        if (dyslexiaFontToggle) dyslexiaFontToggle.checked = this.settings.dyslexiaFont;

        // Letter Spacing
        const letterSpacingRange = document.getElementById('letterSpacingRange');
        const letterSpacingValue = document.getElementById('letterSpacingValue');
        if (letterSpacingRange) {
            letterSpacingRange.value = this.settings.letterSpacing;
            if (letterSpacingValue) {
                letterSpacingValue.textContent = this.settings.letterSpacing === 0 ? 'Normal' : `+${this.settings.letterSpacing}px`;
            }
        }

        // Line Height
        const lineHeightRange = document.getElementById('lineHeightRange');
        const lineHeightValue = document.getElementById('lineHeightValue');
        if (lineHeightRange) {
            lineHeightRange.value = this.settings.lineHeight;
            if (lineHeightValue) lineHeightValue.textContent = this.settings.lineHeight;
        }

        // Focus Indicators
        const focusIndicatorsToggle = document.getElementById('focusIndicatorsToggle');
        if (focusIndicatorsToggle) focusIndicatorsToggle.checked = this.settings.focusIndicators;

        // Background Effects
        const backgroundEffectsToggle = document.getElementById('backgroundEffectsToggle');
        if (backgroundEffectsToggle) backgroundEffectsToggle.checked = this.settings.backgroundEffects;

        // Smooth Scroll
        const smoothScrollToggle = document.getElementById('smoothScrollToggle');
        if (smoothScrollToggle) smoothScrollToggle.checked = this.settings.smoothScroll;
    }

    // Attach event listeners to controls
    attachEventListeners() {
        // Theme Select
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme(this.settings.theme);
                this.saveSettings();
            });
        }

        // Font Size Range
        const fontSizeRange = document.getElementById('fontSizeRange');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeRange) {
            fontSizeRange.addEventListener('input', (e) => {
                this.settings.fontSize = parseInt(e.target.value);
                document.documentElement.style.fontSize = `${this.settings.fontSize}%`;
                if (fontSizeValue) fontSizeValue.textContent = `${this.settings.fontSize}%`;
                this.saveSettings();
            });
        }

        // High Contrast Toggle
        const highContrastToggle = document.getElementById('highContrastToggle');
        if (highContrastToggle) {
            highContrastToggle.addEventListener('change', (e) => {
                this.settings.highContrast = e.target.checked;
                document.body.classList.toggle('high-contrast', this.settings.highContrast);
                this.saveSettings();
            });
        }

        // Reduce Motion Toggle
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.addEventListener('change', (e) => {
                this.settings.reduceMotion = e.target.checked;
                document.body.classList.toggle('reduce-motion', this.settings.reduceMotion);
                this.saveSettings();
            });
        }

        // Dyslexia Font Toggle
        const dyslexiaFontToggle = document.getElementById('dyslexiaFontToggle');
        if (dyslexiaFontToggle) {
            dyslexiaFontToggle.addEventListener('change', (e) => {
                this.settings.dyslexiaFont = e.target.checked;
                document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);
                this.saveSettings();
            });
        }

        // Letter Spacing Range
        const letterSpacingRange = document.getElementById('letterSpacingRange');
        const letterSpacingValue = document.getElementById('letterSpacingValue');
        if (letterSpacingRange) {
            letterSpacingRange.addEventListener('input', (e) => {
                this.settings.letterSpacing = parseFloat(e.target.value);
                document.body.style.letterSpacing = `${this.settings.letterSpacing}px`;
                if (letterSpacingValue) {
                    letterSpacingValue.textContent = this.settings.letterSpacing === 0 ? 'Normal' : `+${this.settings.letterSpacing}px`;
                }
                this.saveSettings();
            });
        }

        // Line Height Range
        const lineHeightRange = document.getElementById('lineHeightRange');
        const lineHeightValue = document.getElementById('lineHeightValue');
        if (lineHeightRange) {
            lineHeightRange.addEventListener('input', (e) => {
                this.settings.lineHeight = parseFloat(e.target.value);
                document.body.style.lineHeight = this.settings.lineHeight;
                if (lineHeightValue) lineHeightValue.textContent = this.settings.lineHeight;
                this.saveSettings();
            });
        }

        // Focus Indicators Toggle
        const focusIndicatorsToggle = document.getElementById('focusIndicatorsToggle');
        if (focusIndicatorsToggle) {
            focusIndicatorsToggle.addEventListener('change', (e) => {
                this.settings.focusIndicators = e.target.checked;
                document.body.classList.toggle('enhanced-focus', this.settings.focusIndicators);
                this.saveSettings();
            });
        }

        // Background Effects Toggle
        const backgroundEffectsToggle = document.getElementById('backgroundEffectsToggle');
        if (backgroundEffectsToggle) {
            backgroundEffectsToggle.addEventListener('change', (e) => {
                this.settings.backgroundEffects = e.target.checked;
                this.saveSettings();
                // Apply background effects toggle
                document.querySelectorAll('.background-effect').forEach(el => {
                    el.style.display = this.settings.backgroundEffects ? '' : 'none';
                });
            });
        }

        // Smooth Scroll Toggle
        const smoothScrollToggle = document.getElementById('smoothScrollToggle');
        if (smoothScrollToggle) {
            smoothScrollToggle.addEventListener('change', (e) => {
                this.settings.smoothScroll = e.target.checked;
                document.documentElement.classList.toggle('smooth-scroll', this.settings.smoothScroll);
                this.saveSettings();
            });
        }

        // Reset Button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default values?')) {
                    this.resetSettings();
                }
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.settings.theme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }

    // Reset all settings to default
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
        this.updateUI();
        
        // Show success message
        this.showNotification('Settings have been reset to default values');
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInUp 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Apply settings globally (for other pages)
function applyGlobalSettings() {
    try {
        const saved = localStorage.getItem('zornSettings');
        if (saved) {
            const settings = JSON.parse(saved);

            // Apply theme
            if (settings.theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.classList.toggle('light-mode', !prefersDark);
            } else {
                document.body.classList.toggle('light-mode', settings.theme === 'light');
            }

            // Apply other settings
            if (settings.fontSize) {
                document.documentElement.style.fontSize = `${settings.fontSize}%`;
            }
            if (settings.highContrast) {
                document.body.classList.add('high-contrast');
            }
            if (settings.reduceMotion) {
                document.body.classList.add('reduce-motion');
            }
            if (settings.dyslexiaFont) {
                document.body.classList.add('dyslexia-font');
            }
            if (settings.letterSpacing !== undefined) {
                document.body.style.letterSpacing = `${settings.letterSpacing}px`;
            }
            if (settings.lineHeight) {
                document.body.style.lineHeight = settings.lineHeight;
            }
            if (settings.focusIndicators) {
                document.body.classList.add('enhanced-focus');
            }
            if (settings.smoothScroll) {
                document.documentElement.classList.add('smooth-scroll');
            }
        }
    } catch (error) {
        console.error('Error applying global settings:', error);
    }
}

// Initialize settings manager when on settings page
if (window.location.pathname.includes('settings.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    // Apply settings on other pages
    applyGlobalSettings();
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(100px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(100px);
        }
    }
`;
document.head.appendChild(style);
