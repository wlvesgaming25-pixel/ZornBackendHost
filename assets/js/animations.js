// Global Animations Initializer for Zorn Website
(function() {
    'use strict';

    // Intersection Observer for scroll animations
    class ScrollAnimations {
        constructor() {
            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.addAnimationClasses();
        }

        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        // Optionally unobserve after animation
                        // observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe elements with animation classes
            const animatedElements = document.querySelectorAll(
                '.observe-fade, .observe-slide-up, .observe-scale, .scroll-animate'
            );

            animatedElements.forEach(el => {
                observer.observe(el);
            });
        }

        addAnimationClasses() {
            // Auto-add scroll animations to common elements
            const sections = document.querySelectorAll('section:not(.no-animate)');
            sections.forEach((section, index) => {
                if (!section.classList.contains('observe-fade') && 
                    !section.classList.contains('observe-slide-up')) {
                    section.classList.add('observe-fade');
                }
            });
        }
    }

    // Smooth scroll to anchors
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offset = 80; // Header offset
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Add hover effects to cards
    function initCardAnimations() {
        const cards = document.querySelectorAll('.card, .position-card, .quick-link-card, .faq-item');
        cards.forEach(card => {
            if (!card.classList.contains('card-float')) {
                card.classList.add('hover-lift');
            }
        });
    }

    // Add button ripple effect
    function initButtonAnimations() {
        const buttons = document.querySelectorAll('.btn:not(.no-animate), button:not(.no-animate)');
        buttons.forEach(btn => {
            if (!btn.classList.contains('btn-animated')) {
                btn.classList.add('btn-animated');
            }

            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Stagger animations for lists
    function initStaggerAnimations() {
        const lists = document.querySelectorAll('.stagger-animate');
        lists.forEach(list => {
            const items = list.children;
            Array.from(items).forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
                item.classList.add('animate-fade-in-up');
            });
        });
    }

    // Parallax effect for hero sections
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Number counter animation
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.count);
            const duration = parseInt(counter.dataset.duration) || 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    animateCounter(entry.target);
                    entry.target.dataset.counted = 'true';
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // Loading state management
    function initLoadingState() {
        document.body.classList.add('page-loading');
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('page-loading');
                document.body.classList.add('page-loaded');
            }, 100);
        });
    }

    // Initialize all animations when DOM is ready
    function init() {
        try {
            // Enable smooth scrolling
            document.documentElement.classList.add('smooth-scroll');

            // Initialize all animation systems
            new ScrollAnimations();
            initSmoothScroll();
            initCardAnimations();
            initButtonAnimations();
            initStaggerAnimations();
            initParallax();
            initCounters();
            initLoadingState();
        } catch (error) {
            // Silently handle animation errors
        }
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for manual initialization if needed
    window.ZornAnimations = {
        init,
        ScrollAnimations
    };
})();
