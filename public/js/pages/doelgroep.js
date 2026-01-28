/**
 * Doelgroep Pages - Interactive functionality
 */

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    
    question.addEventListener('click', () => {
      // Close other open items (optional - remove if you want multiple open)
      // faqItems.forEach(otherItem => {
      //   if (otherItem !== item && otherItem.hasAttribute('open')) {
      //     otherItem.removeAttribute('open');
      //   }
      // });
    });
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Lazy loading for images (if not using native loading="lazy")
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Track CTA clicks for analytics (optional)
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const buttonText = button.textContent.trim();
    const buttonHref = button.getAttribute('href');
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'cta_click', {
        'event_category': 'engagement',
        'event_label': buttonText,
        'value': buttonHref
      });
    }
  });
});
