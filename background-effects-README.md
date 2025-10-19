# Space-Themed Background Effects Test

This directory contains two test pages with different space-themed background effects for the Finemesh Labs coming soon page. Both effects are designed to be subtle and not distracting while adding a dynamic element to the site.

## Test Pages

### 1. Floating Stars Effect (`test-stars.html`)
- **Implementation**: Canvas-based particle system with JavaScript
- **Features**:
  - 150 animated stars that slowly drift across the screen
  - Subtle twinkling effect with varying opacity
  - Different star sizes for depth perception
  - Stars wrap around screen edges for continuous animation
  - Respect for `prefers-reduced-motion` setting

### 2. Nebula Effect (`test-nebula.html`)
- **Implementation**: CSS gradients with layered animations
- **Features**:
  - Three layers of animated radial gradients
  - Subtle color shifts in blues, purples, and hints of magenta
  - Very slow animation (60-100s cycles) for gentle movement
  - Mix-blend-modes for depth and complexity
  - Optional mouse parallax effect (disabled with reduced motion)

## How to Compare

1. **Open the test pages in your browser**:
   - Open `test-stars.html` to see the floating stars effect
   - Open `test-nebula.html` to see the nebula effect
   - Use the navigation at the bottom of each page to switch between effects

2. **Compare the visual impact**:
   - Which effect feels more appropriate for the brand?
   - Which is more subtle and less distracting?
   - Which provides better visual interest without overwhelming the content?

3. **Test accessibility**:
   - Both effects respect `prefers-reduced-motion` settings
   - They include proper ARIA attributes for screen readers
   - The effects are positioned behind all content with `z-index: -1`

4. **Performance considerations**:
   - **Floating Stars**: Uses canvas with requestAnimationFrame (minimal performance impact)
   - **Nebula**: Pure CSS animations (excellent performance, no JavaScript overhead)

## Implementation Details

### Floating Stars
- Uses HTML5 Canvas API for rendering
- JavaScript class-based architecture for maintainability
- Optimized animation loop with requestAnimationFrame
- Automatic cleanup and resize handling
- Reduced motion support with static fallback

### Nebula Effect
- Pure CSS implementation for maximum performance
- Multiple gradient layers with different animation timings
- CSS mix-blend-modes for visual depth
- Subtle parallax effect on mouse movement (optional)
- Graceful degradation for reduced motion preferences

## Accessibility Features

Both implementations include:

- `prefers-reduced-motion` support
- Proper ARIA attributes (`aria-hidden="true"`)
- Screen reader announcements for test indicators
- Keyboard navigation support
- High contrast mode compatibility
- Focus management for navigation elements

## Browser Compatibility

- **Floating Stars**: Requires Canvas API support (IE9+)
- **Nebula**: Requires CSS animations and mix-blend-mode (IE11+ with prefixes)

## Choosing the Right Effect

Consider these factors when selecting:

1. **Performance**: Nebula effect has slightly better performance (pure CSS)
2. **Visual Impact**: Stars provide more dynamic movement, Nebula offers atmospheric depth
3. **Brand Alignment**: Consider which effect better matches the Finemesh Labs brand identity
4. **User Experience**: Both are designed to be subtle, but stars might be more noticeable
5. **Maintenance**: Nebula effect is simpler to maintain (no JavaScript)

## Next Steps

After reviewing both effects:

1. Choose your preferred effect
2. The selected effect can be integrated into the main `index.html`
3. Remove the test navigation and indicators
4. Adjust any styling as needed
5. Test across different devices and browsers

## Files Created

- `test-stars.html` - Floating stars test page
- `test-nebula.html` - Nebula effect test page
- `background-effects-README.md` - This documentation file

All other files (`index.html`, `css/styles.css`, `js/script.js`) remain unchanged to preserve the original implementation.