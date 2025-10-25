// Script to update all social icons in roster.html
// Run this in browser console on the roster page

document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with class 'member-socials'
    const socialSections = document.querySelectorAll('.member-socials');
    
    socialSections.forEach(section => {
        // Replace the class name
        section.className = 'social-icons';
        
        // Get all social-link elements within this section
        const links = section.querySelectorAll('.social-link');
        
        links.forEach((link, index) => {
            // Change class from social-link to social-icon
            link.className = 'social-icon';
            
            // Add appropriate social media classes and icons
            switch(index) {
                case 0: // Twitch
                    link.classList.add('twitch');
                    link.innerHTML = '<img src="assets/img/roster/sociallogos/twitch-logo.png" alt="Twitch">';
                    break;
                case 1: // Twitter/X
                    link.classList.add('twitter');
                    link.innerHTML = '<img src="assets/img/roster/sociallogos/x-logo.png" alt="X">';
                    break;
                case 2: // YouTube
                    link.classList.add('youtube');
                    link.innerHTML = '<img src="assets/img/roster/sociallogos/yt-logo.png" alt="YouTube">';
                    break;
                case 3: // TikTok
                    link.classList.add('tiktok');
                    link.innerHTML = '<img src="assets/img/roster/sociallogos/tiktok-logo.png" alt="TikTok">';
                    break;
                case 4: // Extra icon if present
                    link.style.display = 'none'; // Hide extra icons
                    break;
            }
        });
    });
    
    console.log('Updated', socialSections.length, 'social icon sections');
});