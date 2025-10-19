# Technical Specifications for Mobile Accessibility Refactoring

## HTML Structure Changes

### index.html Updates
```html
<!-- Add skip navigation link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Update semantic structure -->
<header role="banner">
  <div class="container">
    <h1 id="main-title"></h1>
  </div>
</header>

<main id="main-content" role="main">
  <div class="container">
    <section aria-labelledby="coming-soon-heading">
      <h2 id="coming-soon-heading" class="visually-hidden">Coming Soon Information</h2>
      <p>EDC + Fidget</p>
      <p>Coming Soon</p>
    </section>
    
    <section aria-labelledby="signup-heading">
      <h2 id="signup-heading" class="visually-hidden">Newsletter Signup</h2>
      <!-- Mailchimp form with enhanced accessibility -->
    </section>
  </div>
</main>

<footer role="contentinfo">
  <nav aria-label="Social Media Links">
    <div class="social-links">
      <!-- Social links with proper labels -->
    </div>
  </nav>
</footer>
```

### thank-you.html Updates
```html
<!-- Similar semantic structure with focus on success message -->
<main id="main-content" role="main">
  <div class="container">
    <section aria-labelledby="thank-you-heading">
      <h1 id="thank-you-heading">Thank You for Signing Up!</h1>
      <!-- Success content -->
    </section>
  </div>
</main>
```

## CSS Enhancements

### Mobile-First Responsive Typography
```css
/* Fluid typography using clamp() */
:root {
  --fluid-min-width: 320;
  --fluid-max-width: 1140;
  --fluid-screen: 100vw;
  --fluid-bp: calc(
    (var(--fluid-screen) - var(--fluid-min-width) / 16 * 1rem) /
    (var(--fluid-max-width) - var(--fluid-min-width))
  );
}

h1 {
  font-size: clamp(2rem, 4rem + var(--fluid-bp) * 2, 6rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
}

/* Improved readability */
body {
  line-height: 1.6;
  font-size: clamp(1rem, 1rem + var(--fluid-bp) * 0.25, 1.125rem);
}
```

### Touch Target Optimization
```css
/* Minimum touch target 44x44px */
.social-links a {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
}

#mc_embed_signup input.button {
  min-height: 44px;
  padding: 12px 16px;
}

/* Spacing between touch targets */
.social-links a {
  margin: 0 8px;
}
```

### Focus Management
```css
/* High contrast focus indicators */
:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Focus styles for specific elements */
#mc_embed_signup input.email:focus-visible {
  outline: 3px solid #6366f1;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.social-links a:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
  border-radius: 50%;
}
```

### Motion Reduction
```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .fade-in {
    opacity: 1;
    animation: none;
  }
}
```

### Color Contrast Improvements
```css
/* Ensure WCAG AA compliance */
:root {
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #a0a0a0;
  --bg-primary: #121212;
  --bg-secondary: #1a1a1a;
  --accent: #6366f1;
  --accent-hover: #7c7ff3;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #ffffff;
    --bg-primary: #000000;
    --accent: #8b5cf6;
  }
}
```

## JavaScript Enhancements

### Focus Management
```javascript
// Add to script.js
function manageFocus() {
  // Trap focus in modal if present
  // Ensure focus moves to error messages
  // Handle focus after form submission
}

// Keyboard navigation enhancements
function initKeyboardNavigation() {
  document.addEventListener('keydown', function(e) {
    // Handle Escape key
    // Handle Tab navigation
    // Add keyboard shortcuts
  });
}
```

### Screen Reader Announcements
```javascript
// Announce form submission status
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

## Form Accessibility Improvements

### Enhanced Mailchimp Form
```html
<div id="mc_embed_signup">
  <form action="..." method="post" id="mc-embedded-subscribe-form" 
        name="mc-embedded-subscribe-form" class="validate" target="_blank"
        novalidate aria-labelledby="signup-heading">
    
    <div id="mc_embed_signup_scroll">
      <h2>Get notified when we launch!</h2>
      
      <div class="mc-field-group">
        <label for="mce-EMAIL" id="email-label">
          Email Address
          <span class="asterisk" aria-hidden="true">*</span>
          <span class="sr-only">required</span>
        </label>
        <input type="email" name="EMAIL" class="required email" 
               id="mce-EMAIL" required="" value=""
               aria-describedby="email-label email-help email-error"
               aria-required="true">
        <div id="email-help" class="field-help">
          We'll never share your email with anyone else.
        </div>
      </div>
      
      <div id="mce-responses" class="clear foot" role="alert" aria-live="polite">
        <div class="response" id="mce-error-response" style="display: none;" role="alert"></div>
        <div class="response" id="mce-success-response" style="display: none;" role="status"></div>
      </div>
      
      <div class="optionalParent">
        <div class="clear foot">
          <input type="submit" name="subscribe" id="mc-embedded-subscribe" 
                 class="button" value="Sign up"
                 aria-describedby="submit-help">
          <div id="submit-help" class="sr-only">
            Submits your email to our notification list
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
```

## Testing Checklist

### Automated Testing
- [ ] Axe Core accessibility testing
- [ ] Lighthouse accessibility audit
- [ ] WAVE accessibility evaluation
- [ ] Color contrast checker

### Manual Testing
- [ ] VoiceOver (iOS) testing
- [ ] TalkBack (Android) testing
- [ ] Keyboard navigation testing
- [ ] Touch gesture testing
- [ ] Zoom testing (200%)
- [ ] Orientation change testing

### Device Testing
- [ ] iPhone (SE, 12, 14 Pro Max)
- [ ] Android (various screen sizes)
- [ ] Tablet testing (iPad, Android tablets)
- [ ] External keyboard testing