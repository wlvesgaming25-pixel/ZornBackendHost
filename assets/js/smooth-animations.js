// Ultra Smooth Animations Enhancement Script
document.addEventListener('DOMContentLoaded', function() {
    // Smooth page load animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    // Animate page in
    requestAnimationFrame(() => {
        document.body.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    });

    // Update footer Discord count if element exists
    const footerDiscordCount = document.getElementById('footer-discord-count');
    if (footerDiscordCount) {
        // Try to get count from main discord stats or set default
        const mainDiscordCount = document.getElementById('discord-members');
        if (mainDiscordCount && mainDiscordCount.textContent !== '--') {
            footerDiscordCount.textContent = mainDiscordCount.textContent + ' members';
        } else {
            footerDiscordCount.textContent = '400+ members';
        }
    }

    // Add staggered animations to elements
    const animateElements = document.querySelectorAll('.member-card, .partner-card, .contact-item, .form-group');
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px) scale(0.95)';
        element.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        }, 100 + (index * 50));
    });

    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.member-card, .partner-card, .contact-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.willChange = 'transform, box-shadow';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.willChange = 'auto';
        });
    });

    // Smooth scroll enhancements
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form input animations
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px) scale(1.01)';
            this.style.boxShadow = '0 8px 24px rgba(255, 72, 36, 0.15)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // Button click ripple effect
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Parallax effect for hero sections
    const parallaxElements = document.querySelectorAll('.hero, .roster-hero, .apply-hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });
    });
});

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Roster Card Scroll Animations */
    .roster-card-animate {
        opacity: 0;
        transform: translateY(60px) scale(0.9) rotateY(10deg);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform, opacity;
    }
    
    .roster-card-animate.visible {
        opacity: 1;
        transform: translateY(0) scale(1) rotateY(0deg);
    }
    
    /* Staggered Animation Delays for Roster Cards */
    .roster-card-animate:nth-child(1) { transition-delay: 0ms; }
    .roster-card-animate:nth-child(2) { transition-delay: 100ms; }
    .roster-card-animate:nth-child(3) { transition-delay: 200ms; }
    .roster-card-animate:nth-child(4) { transition-delay: 300ms; }
    .roster-card-animate:nth-child(5) { transition-delay: 400ms; }
    .roster-card-animate:nth-child(6) { transition-delay: 500ms; }
    .roster-card-animate:nth-child(7) { transition-delay: 600ms; }
    .roster-card-animate:nth-child(8) { transition-delay: 700ms; }
    .roster-card-animate:nth-child(9) { transition-delay: 800ms; }
    .roster-card-animate:nth-child(10) { transition-delay: 900ms; }
    
    /* Section Title Animations */
    .section-title-animate {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
        transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
    }
    
    .section-title-animate.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    
    /* General scroll animations */
    .fade-in-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
    }
    
    .fade-in-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Enhanced smooth scrolling */
    html {
        scroll-behavior: smooth;
        scroll-padding-top: 100px;
    }
    
    /* Preload optimization */
    .preload * {
        transition-duration: 0s !important;
    }
`;
document.head.appendChild(style);

// Enhanced Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

// Roster cards observer with special handling
const rosterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Add floating animation after initial load
            setTimeout(() => {
                entry.target.style.animation = 'gentleFloat 6s ease-in-out infinite';
                entry.target.style.animationDelay = `${Math.random() * 2}s`;
            }, 1000);
            
            rosterObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -60px 0px'
});

// Section titles observer
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate the underline after title appears
            setTimeout(() => {
                const underline = entry.target.querySelector('::after');
                if (underline) {
                    entry.target.style.setProperty('--underline-width', '100%');
                }
            }, 300);
            
            sectionObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// General observer for other elements
const generalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            generalObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize scroll animations when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Roster cards with special animation
    const rosterCards = document.querySelectorAll('.member-card');
    rosterCards.forEach(card => {
        card.classList.add('roster-card-animate');
        rosterObserver.observe(card);
    });
    
    // Section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('section-title-animate');
        sectionObserver.observe(title);
    });
    
    // Other elements (partners, forms, etc.)
    const otherElements = document.querySelectorAll('.partner-card, .form-group, .contact-item');
    otherElements.forEach(el => {
        el.classList.add('fade-in-on-scroll');
        generalObserver.observe(el);
    });
});