// Help Center Interactive Features
class HelpCenter {
    constructor() {
        this.init();
    }

    init() {
        this.setupAccordion();
        this.setupSearch();
        this.setupScrollToSection();
    }

    // Accordion functionality
    setupAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');

                // Close all other FAQ items in the same category (optional - remove if you want multiple open)
                // const category = faqItem.closest('.faq-category');
                // category.querySelectorAll('.faq-item.active').forEach(item => {
                //     if (item !== faqItem) {
                //         item.classList.remove('active');
                //     }
                // });

                // Toggle current item
                faqItem.classList.toggle('active');

                // Smooth scroll to item if it's being opened and is below viewport
                if (!isActive) {
                    setTimeout(() => {
                        const rect = faqItem.getBoundingClientRect();
                        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
                        
                        if (!isInViewport && rect.top < 0) {
                            faqItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 100);
                }
            });
        });
    }

    // Search functionality
    setupSearch() {
        const searchInput = document.getElementById('helpSearch');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            // Debounce search to avoid too many operations
            searchTimeout = setTimeout(() => {
                this.filterFAQs(e.target.value);
            }, 300);
        });
    }

    // Filter FAQs based on search query
    filterFAQs(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const faqCategories = document.querySelectorAll('.faq-category');
        let totalVisibleItems = 0;

        faqCategories.forEach(category => {
            const faqItems = category.querySelectorAll('.faq-item');
            let categoryHasVisibleItems = false;

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                const matches = question.includes(normalizedQuery) || answer.includes(normalizedQuery);

                if (normalizedQuery === '' || matches) {
                    item.classList.remove('hidden');
                    categoryHasVisibleItems = true;
                    totalVisibleItems++;

                    // Highlight matching text (optional)
                    if (normalizedQuery !== '') {
                        this.highlightText(item, normalizedQuery);
                    } else {
                        this.removeHighlight(item);
                    }
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('active'); // Close hidden items
                }
            });

            // Hide category if no items match
            if (categoryHasVisibleItems) {
                category.classList.remove('hidden');
            } else {
                category.classList.add('hidden');
            }
        });

        // Show/hide "no results" message
        this.toggleNoResults(totalVisibleItems === 0 && normalizedQuery !== '');
    }

    // Highlight matching text in search results
    highlightText(item, query) {
        const questionSpan = item.querySelector('.faq-question span');
        const originalText = questionSpan.getAttribute('data-original-text') || questionSpan.textContent;
        
        if (!questionSpan.getAttribute('data-original-text')) {
            questionSpan.setAttribute('data-original-text', originalText);
        }

        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark style="background: rgba(99, 102, 241, 0.3); color: inherit; padding: 0 2px; border-radius: 2px;">$1</mark>');
        
        questionSpan.innerHTML = highlightedText;
    }

    // Remove highlighting
    removeHighlight(item) {
        const questionSpan = item.querySelector('.faq-question span');
        const originalText = questionSpan.getAttribute('data-original-text');
        
        if (originalText) {
            questionSpan.textContent = originalText;
        }
    }

    // Escape special regex characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Toggle no results message
    toggleNoResults(show) {
        let noResultsEl = document.querySelector('.no-results');

        if (show) {
            if (!noResultsEl) {
                noResultsEl = document.createElement('div');
                noResultsEl.className = 'no-results';
                noResultsEl.innerHTML = `
                    <h3>No Results Found</h3>
                    <p>Try searching with different keywords or browse our FAQ categories below.</p>
                `;
                
                const faqSection = document.querySelector('.faq-section .container');
                if (faqSection) {
                    faqSection.insertBefore(noResultsEl, faqSection.firstChild);
                }
            }
            noResultsEl.style.display = 'block';
        } else {
            if (noResultsEl) {
                noResultsEl.style.display = 'none';
            }
        }
    }

    // Scroll to section when clicking quick links
    setupScrollToSection() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offset = 100; // Offset for sticky header
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Add a subtle highlight effect
                    targetElement.style.transition = 'background-color 0.3s ease';
                    targetElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                    
                    setTimeout(() => {
                        targetElement.style.backgroundColor = '';
                    }, 1500);
                }
            });
        });
    }
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe FAQ categories
    document.querySelectorAll('.faq-category').forEach(category => {
        category.style.opacity = '0';
        category.style.transform = 'translateY(30px)';
        category.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(category);
    });
}

// Add keyboard navigation for accordion
function setupKeyboardNavigation() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach((question, index) => {
        question.setAttribute('tabindex', '0');
        
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
            
            // Arrow key navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = faqQuestions[index + 1];
                if (next) next.focus();
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = faqQuestions[index - 1];
                if (prev) prev.focus();
            }
        });
    });
}

// Track popular questions (analytics)
function trackQuestionClicks() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const questionText = question.querySelector('span').textContent;
            
            // Store in localStorage for analytics
            try {
                const stats = JSON.parse(localStorage.getItem('helpCenterStats') || '{}');
                stats[questionText] = (stats[questionText] || 0) + 1;
                localStorage.setItem('helpCenterStats', JSON.stringify(stats));
            } catch (error) {
                console.error('Error tracking question click:', error);
            }
        });
    });
}

// Print helper
function setupPrintHelper() {
    // Add print stylesheet class when printing
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('printing');
        // Expand all FAQ items for printing
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.add('active');
        });
    });

    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
        // Collapse all FAQ items after printing
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
    });
}

// Add copy link button to FAQ items
function addCopyLinkButtons() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const copyBtn = document.createElement('button');
        
        copyBtn.className = 'copy-link-btn';
        copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
        `;
        copyBtn.title = 'Copy link to this question';
        
        copyBtn.style.cssText = `
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.25rem;
            margin-left: 0.5rem;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        item.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Generate anchor ID if not exists
            if (!item.id) {
                item.id = `faq-${index}`;
            }
            
            const url = `${window.location.origin}${window.location.pathname}#${item.id}`;
            
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                copyBtn.style.color = 'var(--success-color)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                    `;
                    copyBtn.style.color = 'var(--text-secondary)';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy link:', err);
            });
        });
        
        question.appendChild(copyBtn);
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const helpCenter = new HelpCenter();
    setupScrollAnimations();
    setupKeyboardNavigation();
    trackQuestionClicks();
    setupPrintHelper();
    addCopyLinkButtons();

    // Handle direct links to FAQ items (e.g., from URL hash)
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const faqItem = targetElement.classList.contains('faq-item') 
                    ? targetElement 
                    : targetElement.querySelector('.faq-item');
                
                if (faqItem) {
                    faqItem.classList.add('active');
                    faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 500);
    }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HelpCenter };
}
