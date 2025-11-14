// Roster page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeRosterFiltering();
    initializeSearch();
    initializeCarousel();
    initializeScrollAnimations();
});

// Scroll Animation functionality
function initializeScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-fade-in');
    
    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };
    
    const displayScrollElement = (element) => {
        element.classList.add('fade-in-visible');
    };
    
    const hideScrollElement = (element) => {
        element.classList.remove('fade-in-visible');
    };
    
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    };
    
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });
    
    // Initial check for elements already in view
    handleScrollAnimation();
}

// Carousel functionality for owner section
let currentSlide = 0;
const slides = [];

function initializeCarousel() {
    // For now, we only have one slide (owner)
    // This can be expanded later if you want multiple featured members
    const slideElements = document.querySelectorAll('.member-slide');
    slides.push(...slideElements);
}

function changeSlide(direction) {
    if (slides.length <= 1) return; // No need to change if only one slide
    
    // Hide current slide
    slides[currentSlide].classList.remove('active');
    
    // Calculate next slide
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    // Show next slide
    slides[currentSlide].classList.add('active');
}

function initializeRosterFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const memberCards = document.querySelectorAll('.member-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            filterMembers(filterValue, memberCards);
        });
    });
}

function filterMembers(category, memberCards) {
    memberCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            showMemberCard(card);
        } else {
            hideMemberCard(card);
        }
    });
    
    // Update URL without reload
    const url = new URL(window.location);
    if (category !== 'all') {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url);
}

function showMemberCard(card) {
    card.classList.remove('hidden');
    card.style.display = 'block';
    
    // Animate in
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }, 100);
}

function hideMemberCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        card.classList.add('hidden');
        card.style.display = 'none';
    }, 300);
}

function initializeSearch() {
    const searchInput = document.getElementById('memberSearch');
    
    if (searchInput) {
        // Set up global search function
        window.performSearch = function(searchTerm) {
            const memberCards = document.querySelectorAll('.member-card');
            
            memberCards.forEach(card => {
                const memberName = card.querySelector('h3').textContent.toLowerCase();
                const memberRole = card.querySelector('.member-role').textContent.toLowerCase();
                const memberBio = card.querySelector('.member-bio').textContent.toLowerCase();
                const skills = Array.from(card.querySelectorAll('.skill-tag')).map(skill => 
                    skill.textContent.toLowerCase()
                );
                
                const searchableText = `${memberName} ${memberRole} ${memberBio} ${skills.join(' ')}`;
                
                if (searchTerm === '' || searchableText.includes(searchTerm)) {
                    showMemberCard(card);
                } else {
                    hideMemberCard(card);
                }
            });
            
            // Show message if no results
            checkForResults();
        };
        
        // Clear search when clicking the clear button
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '×';
        clearButton.className = 'search-clear';
        clearButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            display: none;
        `;
        
        // Add clear button to search container
        const searchBox = searchInput.parentElement;
        searchBox.style.position = 'relative';
        searchBox.appendChild(clearButton);
        
        // Show/hide clear button
        searchInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        });
        
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            clearButton.style.display = 'none';
            window.performSearch('');
        });
    }
}

function checkForResults() {
    const visibleCards = document.querySelectorAll('.member-card:not(.hidden)');
    const rosterGrid = document.querySelector('.roster-grid');
    
    // Remove existing no-results message
    const existingMessage = document.querySelector('.no-results');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (visibleCards.length === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results';
        noResultsMessage.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
                <h3 style="color: #666; margin-bottom: 1rem;">No members found</h3>
                <p style="color: #999;">Try adjusting your search or filter criteria.</p>
            </div>
        `;
        
        rosterGrid.appendChild(noResultsMessage);
    }
}

// Initialize filters from URL parameters
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        const filterButton = document.querySelector(`[data-filter="${category}"]`);
        if (filterButton) {
            filterButton.click();
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initializeFromURL);

// Member card interactions
document.addEventListener('DOMContentLoaded', function() {
    const memberCards = document.querySelectorAll('.member-card');
    
    memberCards.forEach(card => {
        // Add click to expand functionality
        card.addEventListener('click', function(e) {
            // Don't expand if clicking on social links
            if (e.target.closest('.social-icon')) {
                return;
            }
            
            // Toggle expanded state
            this.classList.toggle('expanded');
        });
        
        // Handle social link clicks
        const socialLinks = card.querySelectorAll('.social-icon');
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation();
                // Social link functionality would go here
                console.log('Social link clicked:', this.textContent);
            });
        });
    });
});

// Lazy loading for member images
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                
                observer.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Call lazy loading initialization
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Export roster-specific functions
window.RosterUtils = {
    filterMembers,
    performSearch: window.performSearch
};

// Content creators section expand/collapse functionality
function toggleContentCards() {
    const additionalCards = document.getElementById('additionalContent');
    const toggleButton = document.getElementById('contentToggle');
    const toggleText = toggleButton.querySelector('.expand-text');
    const toggleIcon = toggleButton.querySelector('.expand-icon');
    
    if (additionalCards.classList.contains('expanded')) {
        // Hide additional cards
        additionalCards.classList.remove('expanded');
        toggleText.textContent = 'Show More Content Creators';
        toggleIcon.textContent = '▼';
        toggleButton.classList.remove('expanded');
    } else {
        // Show additional cards
        additionalCards.classList.add('expanded');
        toggleText.textContent = 'Show Less Content Creators';
        toggleIcon.textContent = '▲';
        toggleButton.classList.add('expanded');
    }
}

// Competitive section expand/collapse functionality
function toggleCompetitiveCards() {
    const additionalCards = document.getElementById('additionalCompetitive');
    const toggleButton = document.getElementById('competitiveToggle');
    const toggleText = toggleButton.querySelector('.expand-text');
    const toggleIcon = toggleButton.querySelector('.expand-icon');
    
    if (additionalCards.classList.contains('expanded')) {
        // Hide additional cards
        additionalCards.classList.remove('expanded');
        toggleText.textContent = 'Show More Competitive Clip Hitters';
        toggleIcon.textContent = '▼';
        toggleButton.classList.remove('expanded');
    } else {
        // Show additional cards
        additionalCards.classList.add('expanded');
        toggleText.textContent = 'Show Less Competitive Clip Hitter';
        toggleIcon.textContent = '▲';
        toggleButton.classList.add('expanded');
    }
}

// Freestylers section expand/collapse functionality
function toggleFreestylerCards() {
    const additionalCards = document.getElementById('additionalFreestylers');
    const toggleButton = document.getElementById('freestylerToggle');
    const toggleText = toggleButton.querySelector('.expand-text');
    const toggleIcon = toggleButton.querySelector('.expand-icon');
    
    if (additionalCards.classList.contains('expanded')) {
        // Hide additional cards
        additionalCards.classList.remove('expanded');
        toggleText.textContent = 'Show More Freestylers';
        toggleIcon.textContent = '▼';
        toggleButton.classList.remove('expanded');
    } else {
        // Show additional cards
        additionalCards.classList.add('expanded');
        toggleText.textContent = 'Show Less Freestylers';
        toggleIcon.textContent = '▲';
        toggleButton.classList.add('expanded');
    }
}

// Make toggle functions globally available
window.toggleManagementCards = toggleManagementCards;
window.toggleContentCards = toggleContentCards;
window.toggleCompetitiveCards = toggleCompetitiveCards;
window.toggleFreestylerCards = toggleFreestylerCards;