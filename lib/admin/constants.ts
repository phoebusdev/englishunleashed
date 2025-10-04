/**
 * Admin Dashboard Theme Constants
 * Spec: specs/001-admin-dashboard-rebuild/specification.md
 *
 * Centralized theme configuration for admin panel to ensure consistent styling
 */

export const ADMIN_COLORS = {
  // Brand colors from existing design
  primary: '#20b2aa', // Turquoise
  primaryHover: '#0f8080',
  secondary: '#ff6b8a', // Pink
  secondaryHover: '#ff5577',

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    900: '#111827',
  },

  // Status colors
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#065f46',

  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#991b1b',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#92400e',

  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#1e40af',
} as const

export const ADMIN_SPACING = {
  cardPadding: '1.5rem',
  sectionGap: '2rem',
  inputHeight: '2.5rem',
} as const

export const ADMIN_TRANSITIONS = {
  default: 'all 0.2s ease-in-out',
} as const
