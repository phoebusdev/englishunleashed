// Font optimization configuration
export const fontConfig = {
  // Google Sans Code font optimization
  googleSansCode: {
    // Font display strategy for better performance
    display: 'swap' as const,
    
    // Preload critical font weights
    preloadWeights: [400, 500, 600, 700],
    
    // Weight settings
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    // Font features for better typography
    features: {
      // Number spacing
      tnum: true, // Tabular numbers for tables
      
      // Ligatures
      liga: true, // Standard ligatures
      calt: true, // Contextual alternates
    },
  },
  
  // Monospace font stack fallbacks
  monospaceFonts: [
    'ui-monospace',
    'SFMono-Regular',
    'Consolas',
    'Liberation Mono',
    'monospace',
  ],
}

// Generate font-face declarations for optimal loading
export function generateFontFace() {
  return `
    .google-sans-code {
      font-family: "Google Sans Code", monospace;
      font-optical-sizing: auto;
      font-style: normal;
    }
  `;
}

// Typography scale optimized for Google Sans Code
export const typographyScale = {
  xs: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    letterSpacing: '0em',
  },
  sm: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    letterSpacing: '0em',
  },
  base: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    letterSpacing: '0em',
  },
  lg: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    letterSpacing: '0em',
  },
  xl: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    letterSpacing: '0em',
  },
  '2xl': {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    letterSpacing: '0em',
  },
  '3xl': {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    letterSpacing: '0em',
  },
  '4xl': {
    fontSize: '2.25rem',
    lineHeight: '2.5rem',
    letterSpacing: '0em',
  },
  '5xl': {
    fontSize: '3rem',
    lineHeight: '1',
    letterSpacing: '0em',
  },
  '6xl': {
    fontSize: '3.75rem',
    lineHeight: '1',
    letterSpacing: '0em',
  },
}