/**
 * Dynamic font loading utility for appearance customization
 */

// Map of font names to their Google Fonts URLs
const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@300;400;500;600;700',
  'Roboto': 'Roboto:wght@300;400;500;700',
  'Open Sans': 'Open+Sans:wght@300;400;500;600;700',
  'Lato': 'Lato:wght@300;400;700',
  'Montserrat': 'Montserrat:wght@300;400;500;600;700',
  'Poppins': 'Poppins:wght@300;400;500;600;700',
  'Source Sans Pro': 'Source+Sans+Pro:wght@300;400;600;700',
  'Nunito': 'Nunito:wght@300;400;500;600;700',
  'Raleway': 'Raleway:wght@300;400;500;600;700',
  'JetBrains Mono': 'JetBrains+Mono:wght@300;400;500;600;700',
  'Fira Code': 'Fira+Code:wght@300;400;500;600;700',
  'Orbitron': 'Orbitron:wght@400;500;600;700;800;900',
  'Rajdhani': 'Rajdhani:wght@300;400;500;600;700'
}

// Keep track of loaded fonts to avoid duplicates
const loadedFonts = new Set<string>()

/**
 * Load a Google Font dynamically
 */
export function loadGoogleFont(fontName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Skip if font is already loaded or is the default Sharp Grotesk
    if (loadedFonts.has(fontName) || fontName === 'Sharp Grotesk') {
      resolve()
      return
    }

    // Check if font is in our supported list
    const googleFontName = GOOGLE_FONTS_MAP[fontName]
    if (!googleFontName) {
      console.warn(`Font "${fontName}" is not supported for dynamic loading`)
      resolve() // Don't reject, just use fallback
      return
    }

    // Create link element for Google Fonts
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${googleFontName}&display=swap`
    
    // Handle load success
    link.onload = () => {
      loadedFonts.add(fontName)
      console.log(`Font "${fontName}" loaded successfully`)
      resolve()
    }
    
    // Handle load error
    link.onerror = () => {
      console.error(`Failed to load font "${fontName}"`)
      reject(new Error(`Failed to load font "${fontName}"`))
    }
    
    // Add to document head
    document.head.appendChild(link)
  })
}

/**
 * Load multiple fonts
 */
export async function loadFonts(fontNames: string[]): Promise<void> {
  const uniqueFonts = [...new Set(fontNames)]
  const loadPromises = uniqueFonts.map(font => loadGoogleFont(font))
  
  try {
    await Promise.all(loadPromises)
  } catch (error) {
    console.error('Some fonts failed to load:', error)
    // Don't throw - we want the app to continue working with fallback fonts
  }
}

/**
 * Get the CSS font family string with fallbacks
 */
export function getFontFamilyWithFallbacks(fontName: string): string {
  if (fontName === 'Sharp Grotesk') {
    return "'Sharp Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
  }
  
  // For monospace fonts
  if (fontName === 'JetBrains Mono' || fontName === 'Fira Code') {
    return `'${fontName}', 'Courier New', monospace`
  }
  
  // For other fonts
  return `'${fontName}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
}

/**
 * Check if a font is loaded
 */
export function isFontLoaded(fontName: string): boolean {
  return loadedFonts.has(fontName) || fontName === 'Sharp Grotesk'
}

/**
 * Get all supported font names
 */
export function getSupportedFonts(): string[] {
  return ['Sharp Grotesk', ...Object.keys(GOOGLE_FONTS_MAP)]
}
