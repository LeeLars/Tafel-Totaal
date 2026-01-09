/**
 * Global Animations - Tafel Totaal
 * Brutalist Corporate Design System
 * 
 * Features:
 * - Scroll Reveal (staggered)
 * - Parallax scrolling
 * - Smooth scroll
 */

// Scroll Reveal Animation
class ScrollReveal {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -50px 0px',
      ...options
    };
    
    this.observer = null;
    this.init();
  }
  
  init() {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );
    
    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      this.observer.observe(el);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve after animation (one-time reveal)
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  // Method to observe new elements (for dynamically loaded content)
  observe(element) {
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }
  
  // Refresh - re-observe all elements
  refresh() {
    document.querySelectorAll('[data-animate]:not(.is-visible)').forEach(el => {
      this.observer.observe(el);
    });
  }
}

// Parallax Effect
class ParallaxScroll {
  constructor(options = {}) {
    this.options = {
      speed: options.speed || 0.2,
      selector: options.selector || '[data-parallax]',
      ...options
    };
    
    this.elements = [];
    this.ticking = false;
    this.init();
  }
  
  init() {
    // Get all parallax elements
    this.elements = Array.from(document.querySelectorAll(this.options.selector));
    
    if (this.elements.length === 0) return;
    
    // Bind scroll event with requestAnimationFrame for performance
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
    
    // Initial update
    this.updateParallax();
  }
  
  updateParallax() {
    const scrollTop = window.pageYOffset;
    
    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallaxSpeed) || this.options.speed;
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Only animate when element is in view
      if (scrollTop + windowHeight > elementTop && scrollTop < elementTop + elementHeight) {
        const yPos = (scrollTop - elementTop) * speed;
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    });
  }
  
  // Refresh elements list
  refresh() {
    this.elements = Array.from(document.querySelectorAll(this.options.selector));
  }
}

// Header Scroll Effect
class HeaderScroll {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || '.site-header',
      scrolledClass: options.scrolledClass || 'scrolled',
      threshold: options.threshold || 50,
      ...options
    };
    
    this.header = document.querySelector(this.options.selector);
    this.ticking = false;
    
    if (this.header) {
      this.init();
    }
  }
  
  init() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateHeader();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
    
    // Initial check
    this.updateHeader();
  }
  
  updateHeader() {
    if (window.pageYOffset > this.options.threshold) {
      this.header.classList.add(this.options.scrolledClass);
    } else {
      this.header.classList.remove(this.options.scrolledClass);
    }
  }
}

// Smooth Scroll for anchor links
class SmoothScroll {
  constructor(options = {}) {
    this.options = {
      offset: options.offset || 80,
      duration: options.duration || 800,
      ...options
    };
    
    this.init();
  }
  
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          this.scrollTo(target);
        }
      });
    });
  }
  
  scrollTo(target) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = targetPosition - this.options.offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Image Lazy Loading with fade-in
class LazyImages {
  constructor() {
    this.init();
  }
  
  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
      });
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}

// Initialize all animations
function initAnimations() {
  // Scroll Reveal
  window.scrollReveal = new ScrollReveal();
  
  // Parallax (only on desktop)
  if (window.innerWidth > 768) {
    window.parallaxScroll = new ParallaxScroll();
  }
  
  // Header scroll effect
  window.headerScroll = new HeaderScroll();
  
  // Smooth scroll
  window.smoothScroll = new SmoothScroll();
  
  // Lazy images
  window.lazyImages = new LazyImages();
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// Export for module usage
export { ScrollReveal, ParallaxScroll, HeaderScroll, SmoothScroll, LazyImages, initAnimations };
