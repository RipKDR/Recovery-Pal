/**
 * Color Constants for Recovery Companion
 * Dark Navy Theme
 */

const primaryBlue = '#3b82f6';
const navyDark = '#0a0f1c';
const navyLight = '#162540';

export const Colors = {
  // Dark theme (primary)
  dark: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: navyDark,
    backgroundSecondary: navyLight,
    card: 'rgba(30, 41, 59, 0.6)',
    cardBorder: 'rgba(51, 65, 85, 0.5)',
    tint: primaryBlue,
    tabIconDefault: '#64748b',
    tabIconSelected: primaryBlue,
    primary: primaryBlue,
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f97316',
  },
  // Light theme (secondary - keeping for compatibility)
  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    background: '#f8fafc',
    backgroundSecondary: '#ffffff',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    tint: primaryBlue,
    tabIconDefault: '#94a3b8',
    tabIconSelected: primaryBlue,
    primary: primaryBlue,
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f97316',
  },
};

export default Colors;
