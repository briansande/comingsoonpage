/* ===================================
   GLOBAL VARIABLES
   =================================== */
// SMS Phone Multi-Country Configuration
if(!window.MC) {
  window.MC = {};
}
window.MC.smsPhoneData = {
  defaultCountryCode: 'US',
  programs: [],
  smsProgramDataCountryNames: []
};

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Get country unicode flag emoji
 * @param {string} countryCode - The country code
 * @returns {string} The flag emoji
 */
function getCountryUnicodeFlag(countryCode) {
   return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
};

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param {string} url - The URL to sanitize
 * @returns {string} The sanitized URL
 */
function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmedUrl = url.trim().toLowerCase();
  if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('vbscript:')) {
    return '#';
  }
  return url;
}

/**
 * Get browser language country code
 * @returns {string|null} The country code or null if not available
 */
const getBrowserLanguage = () => {
  if (!window?.navigator?.language?.split('-')[1]) {
    return window?.navigator?.language?.toUpperCase();
  }
  return window?.navigator?.language?.split('-')[1];
};

/* ===================================
   COUNTRY SELECTION FUNCTIONS
   =================================== */

/**
 * Get default country program based on browser language or default code
 * @param {string} defaultCountryCode - The default country code
 * @param {Array} smsProgramData - Array of SMS program data
 * @returns {Object|null} The default program or null
 */
function getDefaultCountryProgram(defaultCountryCode, smsProgramData) {
  if (!smsProgramData || smsProgramData.length === 0) {
    return null;
  }

  const browserLanguage = getBrowserLanguage();

  if (browserLanguage) {
    const foundProgram = smsProgramData.find(
      (program) => program?.countryCode === browserLanguage,
    );
    if (foundProgram) {
      return foundProgram;
    }
  }

  if (defaultCountryCode) {
    const foundProgram = smsProgramData.find(
      (program) => program?.countryCode === defaultCountryCode,
    );
    if (foundProgram) {
      return foundProgram;
    }
  }

  return smsProgramData[0];
}

/**
 * Update SMS legal text based on country
 * @param {string} countryCode - The country code
 * @param {string} fieldName - The field name
 */
function updateSmsLegalText(countryCode, fieldName) {
  if (!countryCode || !fieldName) {
    return;
  }
  
  const programs = window?.MC?.smsPhoneData?.programs;
  if (!programs || !Array.isArray(programs)) {
    return;
  }
  
  const program = programs.find(program => program?.countryCode === countryCode);
  if (!program || !program.requiredTemplate) {
    return;
  }
  
  const legalTextElement = document.querySelector('#legal-text-' + fieldName);
  if (!legalTextElement) {
    return;
  }
  
  // Remove HTML tags and clean up the text
  const divRegex = new RegExp('</?[div][^>]*>', 'gi');
  const fullAnchorRegex = new RegExp('<a.*?</a>', 'g');
  const anchorRegex = new RegExp('<a href="(.*?)" target="(.*?)">(.*?)</a>');
  
  const requiredLegalText = program.requiredTemplate
    .replace(divRegex, '')
    .replace(fullAnchorRegex, '')
    .slice(0, -1);
  
  const anchorMatches = program.requiredTemplate.match(anchorRegex);
  
  if (anchorMatches && anchorMatches.length >= 4) {
    // Create link element safely using DOM methods instead of innerHTML
    const linkElement = document.createElement('a');
    linkElement.href = sanitizeUrl(anchorMatches[1]);
    linkElement.target = sanitizeHtml(anchorMatches[2]);
    linkElement.textContent = sanitizeHtml(anchorMatches[3]);
    
    legalTextElement.textContent = requiredLegalText + ' ';
    legalTextElement.appendChild(linkElement);
    legalTextElement.appendChild(document.createTextNode('.'));
  } else {
    legalTextElement.textContent = requiredLegalText + '.';
  }
}

/**
 * Generate dropdown options for country selection
 * @param {Array} smsProgramData - Array of SMS program data
 * @returns {string} HTML string of options
 */
function generateDropdownOptions(smsProgramData) {
  if (!smsProgramData || smsProgramData.length === 0) {
    return '';
  }
  
  return smsProgramData.map(program => {
    const flag = getCountryUnicodeFlag(program.countryCode);
    const countryName = getCountryName(program.countryCode);
    const callingCode = program.countryCallingCode || '';
    // Sanitize all values to prevent XSS
    const sanitizedCountryCode = sanitizeHtml(program.countryCode || '');
    const sanitizedCountryName = sanitizeHtml(countryName || '');
    const sanitizedCallingCode = sanitizeHtml(callingCode || '');
    return '<option value="' + sanitizedCountryCode + '">' + sanitizedCountryName + ' ' + sanitizedCallingCode + '</option>';
  }).join('');
}

/**
 * Get country name from country code
 * @param {string} countryCode - The country code
 * @returns {string} The country name
 */
function getCountryName(countryCode) {
  if (window.MC?.smsPhoneData?.smsProgramDataCountryNames && Array.isArray(window.MC.smsPhoneData.smsProgramDataCountryNames)) {
    for (let i = 0; i < window.MC.smsPhoneData.smsProgramDataCountryNames.length; i++) {
      if (window.MC.smsPhoneData.smsProgramDataCountryNames[i].code === countryCode) {
        return window.MC.smsPhoneData.smsProgramDataCountryNames[i].name;
      }
    }
  }
  return countryCode;
}

/**
 * Get default phone number placeholder for a country
 * @param {string} countryCode - The country code
 * @returns {string} The placeholder text
 */
function getDefaultPlaceholder(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') {
    return '+1 000 000 0000'; // Default US placeholder
  }
  
  const mockPlaceholders = [
    {
    countryCode: 'US',
    placeholder: '+1 000 000 0000',
    helpText: 'Include the US country code +1 before the phone number',
  },
  {
    countryCode: 'GB',
    placeholder: '+44 0000 000000',
    helpText: 'Include the GB country code +44 before the phone number',
  },
  {
    countryCode: 'CA',
    placeholder: '+1 000 000 0000',
    helpText: 'Include the CA country code +1 before the phone number',
  },
  {
    countryCode: 'AU',
    placeholder: '+61 000 000 000',
    helpText: 'Include the AU country code +61 before the phone number',
  },
  {
    countryCode: 'DE',
    placeholder: '+49 000 0000000',
    helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
  },
  {
    countryCode: 'FR',
    placeholder: '+33 0 00 00 00 00',
    helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
  },
  {
    countryCode: 'ES',
    placeholder: '+34 000 000 000',
    helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
  },
  {
    countryCode: 'NL',
    placeholder: '+31 0 00000000',
    helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
  },
  {
    countryCode: 'BE',
    placeholder: '+32 000 00 00 00',
    helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
  },
  {
    countryCode: 'CH',
    placeholder: '+41 00 000 00 00',
    helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
  },
  {
    countryCode: 'AT',
    placeholder: '+43 000 000 0000',
    helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
  },
  {
    countryCode: 'IE',
    placeholder: '+353 00 000 0000',
    helpText: 'Include the IE country code +353 before the phone number',
  },
  {
    countryCode: 'IT',
    placeholder: '+39 000 000 0000',
    helpText:
      'Includere il prefisso internazionale IT +39 prima del numero di telefono',
  },
  ];

  const selectedPlaceholder = mockPlaceholders.find(function(item) {
    return item && item.countryCode === countryCode;
  });
  
  return selectedPlaceholder ? selectedPlaceholder.placeholder : mockPlaceholders[0].placeholder;
}

/**
 * Update phone input placeholder based on country
 * @param {string} countryCode - The country code
 * @param {string} fieldName - The field name
 */
function updatePlaceholder(countryCode, fieldName) {
  if (!countryCode || !fieldName) {
    return;
  }
  
  const phoneInput = document.querySelector('#mce-' + fieldName);
  if (!phoneInput) {
    return;
  }
  
  const placeholder = getDefaultPlaceholder(countryCode);
  if (placeholder) {
    phoneInput.placeholder = placeholder;
  }
}

/**
 * Update country code instruction for phone input
 * @param {string} countryCode - The country code
 * @param {string} fieldName - The field name
 */
function updateCountryCodeInstruction(countryCode, fieldName) {
  updatePlaceholder(countryCode, fieldName);
}

/**
 * Get default help text for a country
 * @param {string} countryCode - The country code
 * @returns {string} The help text
 */
function getDefaultHelpText(countryCode) {
  const mockPlaceholders = [
    {
      countryCode: 'US',
      placeholder: '+1 000 000 0000',
      helpText: 'Include the US country code +1 before the phone number',
    },
    {
      countryCode: 'GB',
      placeholder: '+44 0000 000000',
      helpText: 'Include the GB country code +44 before the phone number',
    },
    {
      countryCode: 'CA',
      placeholder: '+1 000 000 0000',
      helpText: 'Include the CA country code +1 before the phone number',
    },
    {
      countryCode: 'AU',
      placeholder: '+61 000 000 000',
      helpText: 'Include the AU country code +61 before the phone number',
    },
    {
      countryCode: 'DE',
      placeholder: '+49 000 0000000',
      helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein',
    },
    {
      countryCode: 'FR',
      placeholder: '+33 0 00 00 00 00',
      helpText: 'Incluez le code pays FR +33 avant le numéro de téléphone',
    },
    {
      countryCode: 'ES',
      placeholder: '+34 000 000 000',
      helpText: 'Incluya el código de país ES +34 antes del número de teléfono',
    },
    {
      countryCode: 'NL',
      placeholder: '+31 0 00000000',
      helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
    },
    {
      countryCode: 'BE',
      placeholder: '+32 000 00 00 00',
      helpText: 'Incluez le code pays BE +32 avant le numéro de téléphone',
    },
    {
      countryCode: 'CH',
      placeholder: '+41 00 000 00 00',
      helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein',
    },
    {
      countryCode: 'AT',
      placeholder: '+43 000 000 0000',
      helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein',
    },
    {
      countryCode: 'IE',
      placeholder: '+353 00 000 0000',
      helpText: 'Include the IE country code +353 before the phone number',
    },
    {
      countryCode: 'IT',
      placeholder: '+39 000 000 0000',
      helpText: 'Includere il prefisso internazionale IT +39 prima del numero di telefono',
    },
  ];
  
  if (!countryCode || typeof countryCode !== 'string') {
    return mockPlaceholders[0].helpText;
  }
  
  const selectedHelpText = mockPlaceholders.find(function(item) {
      return item && item.countryCode === countryCode;
    });
    
    return selectedHelpText ? selectedHelpText.helpText : mockPlaceholders[0].helpText;
}

/**
 * Set default help text for phone input
 * @param {string} countryCode - The country code
 */
function setDefaultHelpText(countryCode) {
  const helpTextSpan = document.querySelector('#help-text');
  if (!helpTextSpan) {
    return;
  }
}

/**
 * Update help text based on country code
 * @param {string} countryCode - The country code
 * @param {string} fieldName - The field name
 */
function updateHelpTextCountryCode(countryCode, fieldName) {
  if (!countryCode || !fieldName) {
    return;
  }
  
  setDefaultHelpText(countryCode);
}

/**
 * Initialize SMS phone dropdown functionality
 * @param {string} fieldName - The field name
 */
function initializeSmsPhoneDropdown(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') {
    return;
  }
  
  const dropdown = document.querySelector('#country-select-' + fieldName);
  const displayFlag = document.querySelector('#flag-display-' + fieldName);
  
  if (!dropdown || !displayFlag) {
    return;
  }

  const smsPhoneData = window.MC?.smsPhoneData;
  if (smsPhoneData && smsPhoneData.programs && Array.isArray(smsPhoneData.programs)) {
    dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
  }

  const defaultProgram = getDefaultCountryProgram(smsPhoneData?.defaultCountryCode, smsPhoneData?.programs);
  if (defaultProgram && defaultProgram.countryCode) {
    dropdown.value = defaultProgram.countryCode;
    
    const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
    if (flagSpan) {
      flagSpan.textContent = getCountryUnicodeFlag(defaultProgram.countryCode);
      flagSpan.setAttribute('aria-label', sanitizeHtml(defaultProgram.countryCode) + ' flag');
    }
    
    updateSmsLegalText(defaultProgram.countryCode, fieldName);
    updatePlaceholder(defaultProgram.countryCode, fieldName);
    updateCountryCodeInstruction(defaultProgram.countryCode, fieldName);
  }

  var phoneInput = document.querySelector('#mce-' + fieldName);
  if (phoneInput && defaultProgram.countryCallingCode) {
    phoneInput.value = defaultProgram.countryCallingCode;
  }

  displayFlag?.addEventListener('click', function(e) {
    dropdown.focus();
  });

  dropdown?.addEventListener('change', function() {
    const selectedCountry = this.value;
    
    if (!selectedCountry || typeof selectedCountry !== 'string') {
      return;
    }
    
    const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
    if (flagSpan) {
      flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
      flagSpan.setAttribute('aria-label', sanitizeHtml(selectedCountry) + ' flag');
    }

    const selectedProgram = window.MC?.smsPhoneData.programs.find(function(program) {
      return program && program.countryCode === selectedCountry;
    });
    var phoneInput = document.querySelector('#mce-' + fieldName);
    if (phoneInput && selectedProgram.countryCallingCode) {
      phoneInput.value = selectedProgram.countryCallingCode;
    }
    
    updateSmsLegalText(selectedCountry, fieldName);
    updatePlaceholder(selectedCountry, fieldName);
    updateCountryCodeInstruction(selectedCountry, fieldName);
  });
}

/* ===================================
   TITLE ANIMATION
   =================================== */

/**
 * Initialize title animation with fade-in effect
 */
function initTitleAnimation() {
   const title = "finemesh labs";
   const mainTitle = document.getElementById("main-title");

   // Split title into words
   const words = title.split(" ");
   
   words.forEach((word, wordIndex) => {
       // Create a span for each word to keep words together
       const wordSpan = document.createElement("span");
       wordSpan.className = "word";
       
       // Split each word into characters for animation
       word.split("").forEach((char, charIndex) => {
           const charSpan = document.createElement("span");
           charSpan.textContent = char;
           charSpan.className = "fade-in";
           // Calculate delay based on both word and character position
           const totalIndex = wordIndex * word.length + charIndex;
           charSpan.style.animationDelay = `${totalIndex * 0.031}s`;
           wordSpan.appendChild(charSpan);
       });
       
       mainTitle.appendChild(wordSpan);
       
       // Add a space between words (except after the last word)
       if (wordIndex < words.length - 1) {
           const spaceSpan = document.createElement("span");
           spaceSpan.textContent = " ";
           spaceSpan.className = "fade-in word-space";
           spaceSpan.style.animationDelay = `${(wordIndex + 1) * word.length * 0.031}s`;
           mainTitle.appendChild(spaceSpan);
       }
   });
}

/* ===================================
   ACCESSIBILITY UTILITIES
   =================================== */

/**
 * Announce message to screen readers
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Trap focus within a container
 * @param {HTMLElement} container - The container to trap focus in
 */
function trapFocus(container) {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
        
        if (e.key === 'Escape') {
            container.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();
}

/* ===================================
   KEYBOARD NAVIGATION
   =================================== */

/**
 * Initialize keyboard navigation enhancements
 */
function initKeyboardNavigation() {
    // Handle Escape key for closing modals or resetting forms
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Reset form if it has focus
            const form = document.getElementById('mc-embedded-subscribe-form');
            const emailInput = document.getElementById('mce-EMAIL');
            
            if (form && form.contains(document.activeElement)) {
                if (emailInput) {
                    emailInput.value = '';
                    emailInput.focus();
                    announceToScreenReader('Form reset');
                }
            }
        }
        
        // Handle Enter key on social links
        if (e.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('social-link')) {
                focusedElement.click();
            }
        }
    });
    
    // Add keyboard shortcut for newsletter signup (Ctrl/Cmd + K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const emailInput = document.getElementById('mce-EMAIL');
            if (emailInput) {
                emailInput.focus();
                announceToScreenReader('Newsletter signup form focused');
            }
        }
    });
}

/* ===================================
   FORM HANDLING
   =================================== */

/**
 * Initialize form submission handling and UI interactions
 */
function initFormHandling() {
   const subscribeForm = document.getElementById('mc-embedded-subscribe-form');
   const submitButton = document.getElementById('mc-embedded-subscribe');
   const emailInput = document.getElementById('mce-EMAIL');
   
   if (subscribeForm && submitButton) {
       subscribeForm.addEventListener('submit', function() {
           // Add loading state to button
           const originalText = submitButton.value;
           submitButton.value = 'Subscribing...';
           submitButton.style.opacity = '0.7';
           submitButton.style.cursor = 'not-allowed';
           submitButton.disabled = true;
           
           // Announce to screen readers
           announceToScreenReader('Subscribing to newsletter...');
           
           // Reset button after 3 seconds (in case there's no response)
           setTimeout(() => {
               submitButton.value = originalText;
               submitButton.style.opacity = '1';
               submitButton.style.cursor = 'pointer';
               submitButton.disabled = false;
               
               // Announce completion if still on page
               if (document.body.contains(subscribeForm)) {
                   announceToScreenReader('Subscription process completed');
               }
           }, 3000);
       });
       
       // Handle form validation errors
       const errorResponse = document.getElementById('mce-error-response');
       const successResponse = document.getElementById('mce-success-response');
       
       if (errorResponse) {
           const observer = new MutationObserver(function(mutations) {
               mutations.forEach(function(mutation) {
                   if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                       if (errorResponse.style.display !== 'none') {
                           announceToScreenReader('Form submission error: ' + errorResponse.textContent);
                           emailInput.focus();
                       }
                   }
               });
           });
           observer.observe(errorResponse, { attributes: true });
       }
       
       if (successResponse) {
           const observer = new MutationObserver(function(mutations) {
               mutations.forEach(function(mutation) {
                   if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                       if (successResponse.style.display !== 'none') {
                           announceToScreenReader('Successfully subscribed to newsletter');
                       }
                   }
               });
           });
           observer.observe(successResponse, { attributes: true });
       }
   }
   
   // Add input animation effect and accessibility enhancements
   if (emailInput) {
       emailInput.addEventListener('focus', function() {
           this.parentElement.style.transform = 'scale(1.02)';
           announceToScreenReader('Email input field focused');
       });
       
       emailInput.addEventListener('blur', function() {
           this.parentElement.style.transform = 'scale(1)';
       });
       
       // Add input validation feedback
       emailInput.addEventListener('input', function() {
           const isValid = this.checkValidity() && this.value.length > 0;
           if (isValid) {
               this.setAttribute('aria-invalid', 'false');
           } else if (this.value.length > 0) {
               this.setAttribute('aria-invalid', 'true');
           }
       });
   }
}

/* ===================================
   INITIALIZATION
   =================================== */

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
   // Initialize title animation
   initTitleAnimation();
   
   // Initialize keyboard navigation
   initKeyboardNavigation();
   
   // Initialize form handling
   initFormHandling();
   
   // Initialize SMS phone dropdowns
   const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
   smsPhoneFields.forEach(function(dropdown) {
       const fieldName = dropdown?.id.replace('country-select-', '');
       initializeSmsPhoneDropdown(fieldName);
   });
   
   // Add social link keyboard support
   const socialLinks = document.querySelectorAll('.social-links a');
   socialLinks.forEach(function(link) {
       link.classList.add('social-link');
       link.setAttribute('role', 'button');
       link.setAttribute('tabindex', '0');
   });
   
   // Announce page load to screen readers
   setTimeout(() => {
       announceToScreenReader('Finemesh Labs coming soon page loaded');
   }, 500);
});

/* ===================================
   TOUCH AND GESTURE SUPPORT
   =================================== */

/**
 * Initialize touch gesture support for mobile devices
 */
function initTouchSupport() {
   // Add touch feedback for interactive elements
   const touchElements = document.querySelectorAll('button, a, input');
   
   touchElements.forEach(element => {
       element.addEventListener('touchstart', function() {
           this.style.transform = 'scale(0.98)';
       }, { passive: true });
       
       element.addEventListener('touchend', function() {
           this.style.transform = 'scale(1)';
       }, { passive: true });
   });
}

// Initialize touch support when DOM is ready
if ('ontouchstart' in window) {
   document.addEventListener('DOMContentLoaded', initTouchSupport);
}

/* ===================================
   PERFORMANCE OPTIMIZATION
   =================================== */

/**
 * Optimize images for different screen densities
 */
function optimizeImages() {
   const images = document.querySelectorAll('img[src*="wikimedia.org"]');
   
   images.forEach(img => {
       // Add loading attribute for lazy loading
       if (!img.hasAttribute('loading')) {
           img.setAttribute('loading', 'lazy');
       }
       
       // Optimize for high DPI displays
       if (window.devicePixelRatio > 1) {
           const src = img.getAttribute('src');
           if (src && !src.includes('svg')) {
               // For raster images, we could serve higher resolution versions
               img.style.imageRendering = 'crisp-edges';
           }
       }
   });
}

// Initialize image optimization
document.addEventListener('DOMContentLoaded', optimizeImages);

/* ===================================
   NEBULA BACKGROUND ENHANCEMENT
   =================================== */

/**
 * Nebula effect enhancements with parallax and accessibility
 */
class NebulaEnhancer {
    constructor() {
        this.layers = document.querySelectorAll('.nebula-layer');
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }
    
    init() {
        // Handle reduced motion preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
            this.updateAnimationState();
        });
        
        // Add subtle parallax effect on mouse movement (only if not reduced motion)
        if (!this.reducedMotion) {
            this.initParallax();
        }
    }
    
    initParallax() {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        });
        
        const animate = () => {
            if (this.reducedMotion) return;
            
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;
            
            this.layers.forEach((layer, index) => {
                const depth = (index + 1) * 0.5;
                layer.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    updateAnimationState() {
        this.layers.forEach(layer => {
            if (this.reducedMotion) {
                layer.style.animation = 'none';
                layer.style.transform = 'none';
            } else {
                // Restore original animations
                layer.style.animation = '';
            }
        });
    }
}

// Initialize nebula enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize nebula enhancer
    const nebula = new NebulaEnhancer();
});