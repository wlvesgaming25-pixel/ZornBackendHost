// Simple Discord webhook integration for Team Zorn applications
console.log('Loading applications-simple.js');

const webhookUrls = {
    'freestyler': 'https://discord.com/api/webhooks/1422213487542669434/lxJlUHkES5gpy64s2_GYOPXDKhBTH_j4eLktI0lBPiiAp0vMKKhV0G6k-QdBSvgiDd8L',
    'competitive-player': 'https://discord.com/api/webhooks/1422213442307231788/-oDiPhkJMLxW5CAILA4Ydwrcjfk1y8doonqtosgQ95prla2we6vzc1MRwfesulVhYKYM',
    'video-editor': 'https://discord.com/api/webhooks/1422213396962738216/KeGc0wuN79Bd6aCTKQmh-eI1ALdHjQluT1SFG8gYhqyXoTX9xAcEXO8ohNpafE-w6bv7',
    'designer': 'https://discord.com/api/webhooks/1422213298631217183/rF7Wschxfhs-9GyPOf7XnSKZoC_kK5qvF0u2GObWR8PGY7XT3LpWGQW4-q7wJNw3_phd',
    'content-creator': 'https://discord.com/api/webhooks/1422213542379130883/Zn3QzVLDmEPmYd8-Mz1kfQ1FGYQM-0I0xdYMA34v41uf7VSDG3voL_EWvLGtit6_ydf8',
    'management': 'https://discord.com/api/webhooks/1422213632275779629/OleZvJaxqOW02-s-lBXpRDr6rcdWD0q_reyMDzakd_mm2WKj0GDlKUrYYlxb1YNm3psq',
    'coach': 'https://discord.com/api/webhooks/1422213632275779629/OleZvJaxqOW02-s-lBXpRDr6rcdWD0q_reyMDzakd_mm2WKj0GDlKUrYYlxb1YNm3psq',
    'other': 'https://discord.com/api/webhooks/1422213632275779629/OleZvJaxqOW02-s-lBXpRDr6rcdWD0q_reyMDzakd_mm2WKj0GDlKUrYYlxb1YNm3psq'
};

const positionNames = {
    'freestyler': 'Freestyler',
    'competitive-player': 'Competitive Clip Hitter',
    'video-editor': 'Video Editor',
    'designer': 'Designer/Graphics',
    'content-creator': 'Content Creator',
    'management': 'Management',
    'coach': 'Coach',
    'other': 'Other'
};

// Notification functions to replace alert dialogs
function showSuccessNotification(message) {
    console.log('🟢 showSuccessNotification called:', message);
    
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
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
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showErrorNotification(message) {
    console.log('🔴 showErrorNotification called:', message);
    
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification error';
    
    // Handle multi-line messages by converting newlines to HTML line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    notification.innerHTML = `
        <div class="notification-content">
            <strong>❌ Submission Failed</strong>
            <p>${formattedMessage}</p>
            <p>Please try again or contact us directly if the problem persists.</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 7 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 7000);
}

async function submitApplication(event) {
    console.log('=== SUBMIT APPLICATION CALLED ===');
    console.log('🚀 Event:', event);
    console.log('🚀 Event target:', event.target);
    console.log('🚀 Current timestamp:', new Date().toISOString());
    event.preventDefault();
    
    // Get the form properly - event.target might be the submit button, not the form
    const form = event.target.tagName === 'FORM' ? event.target : event.target.closest('form');
    console.log('Form:', form);
    console.log('Event target:', event.target);
    console.log('Form tag name:', form?.tagName);
    
    if (!form) {
        console.error('Could not find form element');
        showErrorNotification('Form not found. Please try again.');
        return;
    }
    
    // Use FormData API to properly extract form data
    const formData = new FormData(form);
    console.log('FormData entries:');
    
    const formObj = {};
    for (let [key, value] of formData.entries()) {
        formObj[key] = value;
        console.log(`${key}: "${value}"`);
    }
    
    // Also log traditional method for comparison
    const inputs = form.querySelectorAll('input, textarea, select');
    console.log('Traditional method - Found inputs:', inputs.length);
    inputs.forEach(input => {
        if (input.name) {
            console.log(`Traditional: ${input.name} = "${input.value}"`);
        }
    });
    
    const position = formObj.position;
    console.log('Position:', position);
    
    if (!position) {
        showErrorNotification('Position not found in form data!');
        return;
    }
    
    // Route management to the 'other' webhook to match main handler
    const webhookKey = (position === 'management') ? 'other' : position;
    const webhookUrl = webhookUrls[webhookKey] || webhookUrls['other'];
    console.log('Webhook URL:', webhookUrl);

    if (!webhookUrl) {
        showErrorNotification(`No webhook configured for position: ${position}`);
        return;
    }
    
    // Validate required fields using FormData
    const requiredFields = [];
    
    console.log('=== VALIDATION DEBUG ===');
    console.log('Form data object:', formObj);
    
    // Get all required fields that actually exist in this form
    const requiredElements = form.querySelectorAll('[required]');
    console.log('Found required elements:', requiredElements.length);
    
    requiredElements.forEach(fieldElement => {
        const fieldName = fieldElement.name;
        if (!fieldName) {
            console.log(`⏭️ Skipping element without name attribute`);
            return;
        }
        
        const formValue = formObj[fieldName];
        console.log(`Validating ${fieldName}: "${formValue}" (type: ${fieldElement.type})`);
        
        if (fieldElement.type === 'checkbox') {
            // For checkboxes, FormData only includes them if checked
            if (!formValue) {
                console.log(`❌ Checkbox ${fieldName} is not checked`);
                const label = form.querySelector(`label[for="${fieldElement.id}"]`);
                const friendlyName = label ? label.textContent.replace('*', '').trim() : fieldName;
                requiredFields.push(friendlyName);
            } else {
                console.log(`✅ Checkbox ${fieldName} is checked`);
            }
        } else {
            // For text fields, textareas, selects
            if (!formValue || formValue.toString().trim() === '') {
                console.log(`❌ Field ${fieldName} is empty`);
                const label = form.querySelector(`label[for="${fieldElement.id}"]`);
                const friendlyName = label ? label.textContent.replace('*', '').trim() : fieldName;
                requiredFields.push(friendlyName);
            } else {
                console.log(`✅ Field ${fieldName} has value: "${formValue}"`);
            }
        }
    });
    
    console.log('Missing required fields:', requiredFields);
    console.log('=== END VALIDATION DEBUG ===');
    
    if (requiredFields.length > 0) {
        showErrorNotification('Please fill in all required fields:\n\n• ' + requiredFields.join('\n• '));
        return;
    }
    
    // Create the embed object (just the embed, not wrapped in embeds array yet)
    const embedObject = {
        title: `🎯 New ${positionNames[position]} Application`,
        description: `**👤 Applicant:** ${formObj.fullName || 'N/A'}`,
        color: 16724708,
        fields: [
            { name: 'Discord Username', value: formObj.discordTag || 'N/A', inline: false }
        ],
        footer: { text: 'ZornHQ Applications' },
        timestamp: new Date().toISOString()
    };

    // Add position-specific fields based on role
    if (position === 'freestyler') {
        if (formObj.rlRank) embedObject.fields.push({ name: 'Rank', value: formObj.rlRank, inline: false });
        if (formObj.specialSkills) embedObject.fields.push({ name: 'Specialty Skills', value: formObj.specialSkills, inline: false });
        if (formObj.contentLinks) embedObject.fields.push({ name: 'Content Portfolio', value: formObj.contentLinks, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'competitive-player') {
        if (formObj.rlRank) embedObject.fields.push({ name: 'Rank', value: formObj.rlRank, inline: false });
        if (formObj.preferredRole) embedObject.fields.push({ name: 'Preferred Role', value: formObj.preferredRole, inline: false });
        if (formObj.competitiveExperience) embedObject.fields.push({ name: 'Competitive Experience', value: formObj.competitiveExperience, inline: false });
        if (formObj.strengths) embedObject.fields.push({ name: 'Strengths & Playstyle', value: formObj.strengths, inline: false });
        if (formObj.gameplayLinks) embedObject.fields.push({ name: 'Gameplay Links', value: formObj.gameplayLinks, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'video-editor') {
        if (formObj.editingExperience) embedObject.fields.push({ name: 'Editing Experience', value: formObj.editingExperience, inline: false });
        if (formObj.softwareUsed) embedObject.fields.push({ name: 'Software Used', value: formObj.softwareUsed, inline: false });
        if (formObj.portfolioLinks) embedObject.fields.push({ name: 'Portfolio Links', value: formObj.portfolioLinks, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'designer') {
        if (formObj.designSpecialization) embedObject.fields.push({ name: 'Specialization', value: formObj.designSpecialization, inline: false });
        if (formObj.softwareUsed) embedObject.fields.push({ name: 'Software Used', value: formObj.softwareUsed, inline: false });
        if (formObj.portfolio) embedObject.fields.push({ name: 'Portfolio', value: formObj.portfolio, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'content-creator') {
        if (formObj.contentType) embedObject.fields.push({ name: 'Content Type', value: formObj.contentType, inline: false });
        if (formObj.contentLinks) embedObject.fields.push({ name: 'Content Links', value: formObj.contentLinks, inline: false });
        if (formObj.postingFrequency) embedObject.fields.push({ name: 'Posting Frequency', value: formObj.postingFrequency, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'management') {
        if (formObj.experience) embedObject.fields.push({ name: 'Management Experience', value: formObj.experience, inline: false });
        if (formObj.skills) embedObject.fields.push({ name: 'Skills', value: formObj.skills, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else if (position === 'coach') {
        if (formObj.coachingExperience) embedObject.fields.push({ name: 'Coaching Experience', value: formObj.coachingExperience, inline: false });
        if (formObj.coachingStyle) embedObject.fields.push({ name: 'Coaching Style', value: formObj.coachingStyle, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    } else {
        // Default for other positions
        if (formObj.experience) embedObject.fields.push({ name: 'Experience', value: formObj.experience, inline: false });
        if (formObj.motivation) embedObject.fields.push({ name: 'Why Team Zorn', value: formObj.motivation, inline: false });
    }
    
    const payload = {
        embeds: [embedObject]
    };
    
    console.log('Sending payload:', payload);
    
    try {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.textContent = 'Submitting...';
            button.disabled = true;
        }
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Application sent to Discord successfully');
            
            // Store application for dashboard review
            storeApplicationForDashboard(formObj, position);
            
            showSuccessNotification('Application submitted successfully! We will review it and get back to you.');
            form.reset();
            
            // Reset button and return on success
            if (button) {
                button.textContent = 'Submit Application';
                button.disabled = false;
            }
            return; // Exit function on success
        } else {
            console.error('Discord response:', response.status, response.statusText);
            showErrorNotification('Failed to submit application. Please try again.');
        }
        
        if (button) {
            button.textContent = 'Submit Application';
            button.disabled = false;
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showErrorNotification('Failed to submit application. Please try again.');
        
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.textContent = 'Submit Application';
            button.disabled = false;
        }
    }
}

// Dashboard Integration Functions
function storeApplicationForDashboard(formData, position) {
    try {
        console.log('📊 Storing application for dashboard review...');
        
        // Create application object for dashboard
        const application = {
            id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: formData.fullName || formData.name,
            email: formData.email,
            role: positionNames[position] || position,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            message: formData.motivation || formData.whyJoin || formData.experience || formData.message || 'No message provided',
            isDemo: false, // Mark as real application
            
            // Additional fields based on form data
            discordTag: formData.discordTag || formData.discord,
            age: formData.age,
            timezone: formData.timezone,
            availability: formData.availability,
            experience: formData.experience,
            portfolio: formData.portfolio || formData.contentLinks
        };

        // Add role-specific fields
        if (position === 'competitive-player' || position === 'freestyler') {
            application.rank = formData.currentRank || formData.rank;
            application.hoursPlayed = formData.hoursPlayed;
            application.tournamentExperience = formData.tournamentExperience;
            application.teamExperience = formData.teamExperience;
            application.mainAgent = formData.mainAgent;
        }

        if (position === 'video-editor' || position === 'designer') {
            application.software = formData.software ? 
                formData.software.split(',').map(s => s.trim()) : [];
            application.style = formData.style;
            application.turnaround = formData.turnaround;
        }

        if (position === 'content-creator') {
            application.contentStyle = formData.contentStyle;
            application.postingFrequency = formData.postingFrequency;
            application.equipment = formData.equipment;
        }

        if (position === 'management' || position === 'coach') {
            application.skills = formData.skills ? 
                formData.skills.split(',').map(s => s.trim()) : [];
            application.previousTeams = formData.previousTeams;
            application.achievements = formData.achievements;
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
        
        // Notify any open dashboard windows
        notifyDashboard(application);
        
    } catch (error) {
        console.error('❌ Failed to store application for dashboard:', error);
        // Don't throw error as this shouldn't block the main submission
    }
}

function notifyDashboard(application) {
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
}

// Make submitApplication globally available immediately (before DOMContentLoaded)
// This is critical for inline onsubmit handlers in the HTML
window.submitApplication = submitApplication;
console.log('Global submitApplication function set immediately on script load');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for forms...');
    
    const forms = document.querySelectorAll('.apply-form');
    console.log(`Found ${forms.length} application forms`);
    
    forms.forEach((form, index) => {
        console.log(`Setting up form ${index + 1}`);
        form.addEventListener('submit', submitApplication);
    });
});

// Add global error handlers to catch any unhandled errors
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    // Don't show notification for every error, just log it
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser error dialog
});