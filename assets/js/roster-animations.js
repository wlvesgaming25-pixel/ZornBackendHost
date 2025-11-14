// Enhanced Roster Animations
document.addEventListener('DOMContentLoaded', function() {
    // Add scroll-triggered stagger animation for roster sections
    const rosterSections = document.querySelectorAll('.roster-section');
    
    rosterSections.forEach((section, sectionIndex) => {
        const cards = section.querySelectorAll('.member-card');
        const sectionTitle = section.querySelector('.section-title');
        
        // Enhanced intersection observer for each section
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate section title first
                    if (sectionTitle) {
                        sectionTitle.classList.add('visible');
                        
                        // Animate underline expansion
                        setTimeout(() => {
                            sectionTitle.style.setProperty('--underline-width', '80px');
                        }, 400);
                    }
                    
                    // Then animate cards with staggered delays
                    cards.forEach((card, cardIndex) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                            
                            // Add shimmer effect
                            setTimeout(() => {
                                card.classList.add('shimmer');
                            }, 200);
                            
                            // Start floating animation after entrance
                            setTimeout(() => {
                                card.style.animation = `gentleFloat ${6 + Math.random() * 3}s ease-in-out infinite`;
                                card.style.animationDelay = `${Math.random() * 2}s`;
                            }, 800 + (cardIndex * 100));
                            
                        }, cardIndex * 150); // Stagger by 150ms
                    });
                    
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });
        
        sectionObserver.observe(section);
    });
    
    // Add enhanced hover effects
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
        // Mouse enter - pause floating and add custom hover
        card.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
            this.style.willChange = 'transform, box-shadow';
            
            // Add subtle rotation on hover
            this.style.transform = 'translateY(-8px) scale(1.02) rotateY(2deg)';
        });
        
        // Mouse leave - resume floating
        card.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
            this.style.willChange = 'auto';
            this.style.transform = '';
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 0.8;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255, 72, 36, 0.3) 0%, transparent 70%);
                transform: scale(0);
                animation: cardRipple 0.8s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
                z-index: 10;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 800);
        });
    });
    
    // Enhanced social link animations
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link, index) => {
        link.addEventListener('mouseenter', function() {
            // Animate other social links to scale down slightly
            socialLinks.forEach((otherLink, otherIndex) => {
                if (otherIndex !== index) {
                    otherLink.style.transform = 'scale(0.9) translateY(2px)';
                    otherLink.style.opacity = '0.6';
                }
            });
        });
        
        link.addEventListener('mouseleave', function() {
            // Reset all social links
            socialLinks.forEach(otherLink => {
                otherLink.style.transform = '';
                otherLink.style.opacity = '';
            });
        });
    });
});

// Add CSS for roster-specific animations
const rosterStyle = document.createElement('style');
rosterStyle.textContent = `
    @keyframes cardRipple {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    
    @keyframes shimmerEffect {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }
    
    .member-card.shimmer::before {
        animation: shimmerEffect 1.5s ease-out;
    }
    
    /* Enhanced section animations */
    .roster-section {
        perspective: 1000px;
    }
    
    .members-grid {
        transform-style: preserve-3d;
    }
    
    /* Smooth scroll behavior for roster sections */
    .roster-section {
        scroll-margin-top: 120px;
    }
`;
document.head.appendChild(rosterStyle);