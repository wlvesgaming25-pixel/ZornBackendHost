// Team Zorn Application Handler with Backend Integration
class ApplicationSubmissionHandler {
    constructor() {
        // Backend URL configuration
        this.backendUrl = this.getBackendUrl();
        
        // Application type mapping
        this.applicationTypes = {
            'freestyler': 'competitive',
            'competitive-player': 'competitive',
            'video-editor': 'editor',
            'designer': 'designer',
            'content-creator': 'creator',
            'management': 'management',
            'coach': 'coach',
            'other': 'other'
        };

        this.positionNames = {
            'freestyler': 'Freestyler',
            'competitive-player': 'Competitive Clip Hitter',
            'video-editor': 'Video Editor',
            'designer': 'Designer/Graphics',
            'content-creator': 'Content Creator',
            'management': 'Management',
            'coach': 'Coach',
            'other': 'Other Position'
        };

        // Fallback Discord webhooks (for backup)
        this.webhookUrls = {
            'freestyler': 'https://discord.com/api/webhooks/1422213487542669434/lxJlUHkES5gpy64s2_GYOPXDKhBTH_j4eLktI0lBPiiAp0vMKKhV0G6k-QdBSvgiDd8L',
            'competitive-player': 'https://discord.com/api/webhooks/1422213442307231788/-oDiPhkJMLxW5CAILA4Ydwrcjfk1y8doonqtosgQ95prla2we6vzc1MRwfesulVhYKYM',
            'video-editor': 'https://discord.com/api/webhooks/1422213396962738216/KeGc0wuN79Bd6aCTKQmh-eI1ALdHjQluT1SFG8gYhqyXoTX9xAcEXO8ohNpafE-w6bv7',
            'designer': 'https://discord.com/api/webhooks/1422213298631217183/rF7Wschxfhs-9GyPOf7XnSKZoC_kK5qvF0u2GObWR8PGY7XT3LpWGQW4-q7wJNw3_phd',
            'content-creator': 'https://discord.com/api/webhooks/1422213542379130883/Zn3QzVLDmEPmYd8-Mz1kfQ1FGYQM-0I0xdYMA34v41uf7VSDG3voL_EWvLGtit6_ydf8'
        };

        this.init();
    }
    
    getBackendUrl() {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            return 'http://localhost:3003';
        } else {
            return 'https://zorn-backend-applications.onrender.com';
        }
    }

    init() {
        // Add event listeners to all application forms
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, looking for application forms...');
            const forms = document.querySelectorAll('.apply-form');
            console.log(`Found ${forms.length} application forms`);
            
            forms.forEach((form, index) => {
                console.log(`Setting up form ${index + 1}:`, form);
                form.addEventListener('submit', (e) => {
                    console.log('Form submission event triggered');
                    this.handleSubmission(e);
                });
            });
            
            // Also try to bind to forms that might load later
            setTimeout(() => {
                const laterForms = document.querySelectorAll('.apply-form');
                console.log(`Delayed check found ${laterForms.length} forms`);
                laterForms.forEach((form, index) => {
                    if (!form.hasAttribute('data-listener-added')) {
                        console.log(`Adding listener to delayed form ${index + 1}`);
                        form.setAttribute('data-listener-added', 'true');
                        form.addEventListener('submit', (e) => {
                            console.log('Delayed form submission event triggered');
                            this.handleSubmission(e);
                        });
                    }
                });
            }, 1000);
        });
    }

    async handleSubmission(event) {
        console.log('=== FORM SUBMISSION STARTED ===');
        event.preventDefault();
        
        const form = event.target;
        console.log('Form element:', form);
        
        // Try multiple ways to get form data
        const formData = new FormData(form);
        const position = formData.get('position');
        
        console.log('Position:', position);
        
        // Debug all form inputs directly
        console.log('=== DIRECT INPUT VALUES ===');
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            console.log(`${input.name || 'unnamed'}: "${input.value}"`);
        });
        
        console.log('=== FORMDATA ENTRIES ===');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: "${value}"`);
        }
        
        // Test if specific required fields are empty
        const requiredFields = ['fullName', 'email', 'discordTag', 'position'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            alert('Missing required fields: ' + missingFields.join(', '));
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        try {
            // Try backend submission first
            const applicationType = this.applicationTypes[position];
            console.log('Submitting application via backend for type:', applicationType);
            
            const backendUrl = `${this.backendUrl}/api/apply/${applicationType}`;
            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('Application submitted successfully via backend');
                
                // Store application in dashboard system
                this.storeApplicationForDashboard(formData, position);
                
                this.showSuccessMessage(result.message);
                form.reset();
                return;
            } else {
                throw new Error(result.error || 'Backend submission failed');
            }
            
        } catch (backendError) {
            console.warn('Backend submission failed:', backendError);
            console.log('Falling back to Discord webhook...');
            
            try {
                // Fallback to Discord webhook
                const webhookUrl = this.webhookUrls[position];
                if (!webhookUrl) {
                    throw new Error(`No fallback available for position: ${this.positionNames[position] || position}`);
                }

                // Create Discord embed
                const embed = this.createDiscordEmbed(formData, position);
                
                // Send to Discord
                await this.sendToDiscord(webhookUrl, embed);
                
                // Store application in dashboard system
                this.storeApplicationForDashboard(formData, position);
                
                // Show success message
                this.showSuccessMessage('Application submitted via Discord backup system. We\'ll review it and get back to you!');
                form.reset();
                
            } catch (discordError) {
                console.error('Discord submission also failed:', discordError);
                this.showErrorMessage('Both backend and Discord submission failed. Please try again later.');
            }
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    createDiscordEmbed(formData, position) {
        const positionName = this.positionNames[position] || position;
        const timestamp = new Date().toISOString();
        
        // Get basic info
        const fullName = formData.get('fullName') || 'Name not provided';
        const email = formData.get('email') || 'Not provided';
        const discordTag = formData.get('discordTag') || 'Not provided';
        
        // Create field sections for better organization
        const contactFields = [];
        const gameInfoFields = [];
        const experienceFields = [];
        const additionalFields = [];

        // Contact Information Section
        contactFields.push(
            {
                name: "📧 Email Address",
                value: email,
                inline: true
            },
            {
                name: "💬 Discord Tag",
                value: discordTag,
                inline: true
            }
        );

        // Add position-specific fields with better organization
        switch(position) {
            case 'freestyler':
                const rlRank = formData.get('rlRank') || 'Not specified';
                const platform = formData.get('platform') || 'Not specified';
                const freestyleExp = formData.get('freestyleExperience') || 'Not specified';
                const contentLinks = formData.get('contentLinks') || 'Not provided';
                const freestyleSkills = formData.get('specialSkills') || 'Not provided';
                
                gameInfoFields.push(
                    {
                        name: "🎮 Gaming Platform",
                        value: platform,
                        inline: true
                    },
                    {
                        name: "🏆 Rocket League Rank",
                        value: rlRank,
                        inline: true
                    },
                    {
                        name: "⏱️ Freestyle Experience",
                        value: freestyleExp,
                        inline: true
                    }
                );
                
                experienceFields.push(
                    {
                        name: "🎬 Content Portfolio",
                        value: contentLinks.length > 500 ? contentLinks.substring(0, 500) + '...' : contentLinks,
                        inline: false
                    },
                    {
                        name: "⭐ Specialty Skills",
                        value: freestyleSkills.length > 500 ? freestyleSkills.substring(0, 500) + '...' : freestyleSkills,
                        inline: false
                    }
                );
                break;
                
            case 'competitive-player':
                const currentRank = formData.get('rlRank') || 'Not specified';
                const peakRank = formData.get('peakRank') || 'Not specified';
                const preferredRole = formData.get('preferredRole') || 'Not specified';
                const competitiveExp = formData.get('competitiveExperience') || 'Not provided';
                const strengths = formData.get('strengths') || 'Not provided';
                const gamePlatform = formData.get('platform') || 'Not specified';
                
                gameInfoFields.push(
                    {
                        name: "🎮 Gaming Platform",
                        value: gamePlatform,
                        inline: true
                    },
                    {
                        name: "🏆 Current Rank",
                        value: currentRank,
                        inline: true
                    },
                    {
                        name: "🥇 Peak Rank",
                        value: peakRank,
                        inline: true
                    },
                    {
                        name: "⚽ Preferred Position",
                        value: preferredRole,
                        inline: true
                    }
                );
                
                experienceFields.push(
                    {
                        name: "🏅 Competitive Experience",
                        value: competitiveExp.length > 500 ? competitiveExp.substring(0, 500) + '...' : competitiveExp,
                        inline: false
                    },
                    {
                        name: "💪 Strengths & Playstyle",
                        value: strengths.length > 500 ? strengths.substring(0, 500) + '...' : strengths,
                        inline: false
                    }
                );
                break;
                
            case 'video-editor':
                const software = formData.get('software') || 'Not specified';
                const experience = formData.get('experience') || 'Not specified';
                const portfolio = formData.get('portfolio') || 'Not provided';
                const editorSkills = formData.get('specialSkills') || 'Not provided';
                
                gameInfoFields.push(
                    {
                        name: "💻 Primary Software",
                        value: software,
                        inline: true
                    },
                    {
                        name: "📅 Experience Level",
                        value: experience,
                        inline: true
                    }
                );
                
                experienceFields.push(
                    {
                        name: "🎬 Portfolio Links",
                        value: portfolio.length > 500 ? portfolio.substring(0, 500) + '...' : portfolio,
                        inline: false
                    },
                    {
                        name: "⭐ Editing Specialties",
                        value: editorSkills.length > 500 ? editorSkills.substring(0, 500) + '...' : editorSkills,
                        inline: false
                    }
                );
                break;
                
            case 'designer':
                const specialization = formData.get('specialization') || 'Not specified';
                const designPortfolio = formData.get('portfolio') || 'Not provided';
                const designSoftware = formData.get('software') || 'Not provided';
                
                gameInfoFields.push(
                    {
                        name: "🎨 Design Specialization",
                        value: specialization,
                        inline: true
                    }
                );
                
                experienceFields.push(
                    {
                        name: "🎬 Portfolio Links",
                        value: designPortfolio.length > 500 ? designPortfolio.substring(0, 500) + '...' : designPortfolio,
                        inline: false
                    },
                    {
                        name: "💻 Software Skills",
                        value: designSoftware.length > 500 ? designSoftware.substring(0, 500) + '...' : designSoftware,
                        inline: false
                    }
                );
                break;
                
            case 'content-creator':
                const platforms = formData.get('platforms') || 'Not provided';
                const contentType = formData.get('contentType') || 'Not specified';
                const schedule = formData.get('schedule') || 'Not provided';
                const channels = formData.get('channels') || 'Not provided';
                
                gameInfoFields.push(
                    {
                        name: "🎥 Primary Content Type",
                        value: contentType,
                        inline: true
                    }
                );
                
                experienceFields.push(
                    {
                        name: "� Platforms & Followers",
                        value: platforms.length > 400 ? platforms.substring(0, 400) + '...' : platforms,
                        inline: false
                    },
                    {
                        name: "� Upload Schedule",
                        value: schedule.length > 400 ? schedule.substring(0, 400) + '...' : schedule,
                        inline: false
                    },
                    {
                        name: "🔗 Channel Links",
                        value: channels.length > 400 ? channels.substring(0, 400) + '...' : channels,
                        inline: false
                    }
                );
                break;
        }

        // Add availability if provided
        const availability = formData.get('availability');
        if (availability) {
            additionalFields.push({
                name: "⏰ Availability",
                value: availability.length > 400 ? availability.substring(0, 400) + '...' : availability,
                inline: false
            });
        }

        // Always add motivation at the end
        const motivation = formData.get('motivation') || formData.get('coverLetter');
        if (motivation) {
            additionalFields.push({
                name: "💭 Why Team Zorn?",
                value: motivation.length > 800 ? motivation.substring(0, 800) + '...' : motivation,
                inline: false
            });
        }

        // Combine all fields
        const allFields = [
            ...contactFields,
            ...(gameInfoFields.length > 0 ? [{ name: "\u200B", value: "**🎮 Gaming Information**", inline: false }] : []),
            ...gameInfoFields,
            ...(experienceFields.length > 0 ? [{ name: "\u200B", value: "**📊 Experience & Skills**", inline: false }] : []),
            ...experienceFields,
            ...(additionalFields.length > 0 ? [{ name: "\u200B", value: "**📝 Additional Information**", inline: false }] : []),
            ...additionalFields
        ];

        return {
            embeds: [{
                title: `🎯 New ${positionName} Application`,
                description: `**👤 Applicant:** ${fullName}`,
                color: 0xff4824, // Team orange color
                fields: allFields,
                footer: {
                    text: "Team Zorn Application System"
                },
                timestamp: timestamp
            }]
        };
    }

    async sendToDiscord(webhookUrl, embed) {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(embed)
        });

        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
        }

        return response;
    }

    showSuccessMessage(customMessage = null) {
        // Create and show success notification
        const message = customMessage || 'Your application has been successfully submitted to Team Zorn. We\'ll review it and get back to you soon!';
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>✅ Application Submitted!</strong>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showErrorMessage(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>❌ Submission Failed</strong>
                <p>${message}</p>
                <p>Please try again or contact us directly if the problem persists.</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 7 seconds
        setTimeout(() => {
            notification.remove();
        }, 7000);
    }
}

// Initialize the application handler
const appHandler = new ApplicationSubmissionHandler();

// Create a global function for direct form handling
window.submitApplication = function(event) {
    console.log('Global submitApplication called');
    appHandler.handleSubmission(event);
};

// Test function to check form data manually
window.testFormData = function() {
    const form = document.querySelector('.apply-form');
    if (form) {
        const formData = new FormData(form);
        console.log('Manual form data test:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: "${value}"`);
        }
        
        // Test specific fields
        console.log('Direct field access:');
        console.log('fullName input:', document.querySelector('input[name="fullName"]')?.value);
        console.log('email input:', document.querySelector('input[name="email"]')?.value);
        console.log('discordTag input:', document.querySelector('input[name="discordTag"]')?.value);
        console.log('specialization select:', document.querySelector('select[name="specialization"]')?.value);
        console.log('portfolio textarea:', document.querySelector('textarea[name="portfolio"]')?.value);
        console.log('software textarea:', document.querySelector('textarea[name="software"]')?.value);
    } else {
        console.log('No form found');
    }
};

// Add dashboard integration methods to the ApplicationSubmissionHandler class
ApplicationSubmissionHandler.prototype.storeApplicationForDashboard = function(formData, position) {
    try {
        console.log('📊 Storing application for dashboard review...');
        
        // Create application object for dashboard
        const application = {
            id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: formData.get('fullName'),
            email: formData.get('email'),
            role: this.positionNames[position] || position,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            message: formData.get('motivation') || formData.get('whyJoin') || formData.get('experience') || 'No message provided',
            isDemo: false, // Mark as real application
            
            // Additional fields based on form data
            discordTag: formData.get('discordTag'),
            age: formData.get('age'),
            timezone: formData.get('timezone'),
            availability: formData.get('availability'),
            experience: formData.get('experience'),
            portfolio: formData.get('portfolio') || formData.get('contentLinks')
        };

        // Add role-specific fields
        if (position === 'competitive-player' || position === 'freestyler') {
            application.rank = formData.get('currentRank');
            application.hoursPlayed = formData.get('hoursPlayed');
            application.tournamentExperience = formData.get('tournamentExperience');
            application.teamExperience = formData.get('teamExperience');
            application.mainAgent = formData.get('mainAgent');
        }

        if (position === 'video-editor' || position === 'designer') {
            application.software = formData.get('software') ? 
                formData.get('software').split(',').map(s => s.trim()) : [];
            application.style = formData.get('style');
            application.turnaround = formData.get('turnaround');
        }

        if (position === 'content-creator') {
            application.contentStyle = formData.get('contentStyle');
            application.postingFrequency = formData.get('postingFrequency');
            application.equipment = formData.get('equipment');
        }

        if (position === 'management' || position === 'coach') {
            application.skills = formData.get('skills') ? 
                formData.get('skills').split(',').map(s => s.trim()) : [];
            application.previousTeams = formData.get('previousTeams');
            application.achievements = formData.get('achievements');
        }

        // Get existing applications from localStorage
        let existingApplications = [];
        try {
            const stored = localStorage.getItem('zorn_applications');
            if (stored) {
                existingApplications = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load existing applications:', error);
        }

        // Add new application to the beginning of the array
        existingApplications.unshift(application);

        // Save back to localStorage
        localStorage.setItem('zorn_applications', JSON.stringify(existingApplications));
        
        console.log('✅ Application stored for dashboard review:', application.id);
        console.log('📊 Total applications in storage:', existingApplications.length);
        console.log('🆕 New application data:', {
            id: application.id,
            name: application.name,
            email: application.email,
            role: application.role,
            submittedAt: application.submittedAt
        });
        
        // Notify any open dashboard windows
        this.notifyDashboard(application);
        
    } catch (error) {
        console.error('❌ Failed to store application for dashboard:', error);
        // Don't throw error as this shouldn't block the main submission
    }
};

ApplicationSubmissionHandler.prototype.notifyDashboard = function(application) {
    try {
        console.log('📢 Notifying dashboard of new application:', application.name);
        
        // Method 1: Custom event for same tab
        const customEvent = new CustomEvent('zorn_new_application', {
            detail: application
        });
        window.dispatchEvent(customEvent);
        
        // Method 2: localStorage notification for other tabs
        const notification = {
            type: 'new_application',
            application: application,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('zorn_dashboard_notification', JSON.stringify(notification));
        
        // Method 3: Force a localStorage change event by updating a timestamp
        localStorage.setItem('zorn_dashboard_update', Date.now().toString());
        
        // Remove notification after a short delay
        setTimeout(() => {
            localStorage.removeItem('zorn_dashboard_notification');
        }, 2000);
        
        console.log('✅ Dashboard notifications sent successfully');
        
    } catch (error) {
        console.error('❌ Failed to notify dashboard:', error);
    }
};