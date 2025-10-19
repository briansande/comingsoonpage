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

   title.split("").forEach((char, index) => {
       const span = document.createElement("span");
       // Replace space with non-breaking space HTML entity
       span.textContent = char === " " ? "\u00A0" : char;
       span.className = "fade-in";
       span.style.animationDelay = `${index * 0.031}s`;
       mainTitle.appendChild(span);
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
           
           // Reset button after 3 seconds (in case there's no response)
           setTimeout(() => {
               submitButton.value = originalText;
               submitButton.style.opacity = '1';
               submitButton.style.cursor = 'pointer';
               submitButton.disabled = false;
           }, 3000);
       });
   }
   
   // Add input animation effect
   if (emailInput) {
       emailInput.addEventListener('focus', function() {
           this.parentElement.style.transform = 'scale(1.02)';
       });
       
       emailInput.addEventListener('blur', function() {
           this.parentElement.style.transform = 'scale(1)';
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
   
   // Initialize form handling
   initFormHandling();
   
   // Initialize SMS phone dropdowns
   const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
   smsPhoneFields.forEach(function(dropdown) {
       const fieldName = dropdown?.id.replace('country-select-', '');
       initializeSmsPhoneDropdown(fieldName);
   });
});