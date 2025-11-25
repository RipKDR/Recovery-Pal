/**
 * Design Tokens for Recovery Companion V2
 * 
 * These tokens define the visual language of the app following
 * clean, minimal, and accessible design principles.
 * 
 * Design Philosophy:
 * 1. Clean & Minimal — Google/Apple-level simplicity
 * 2. Content-First — UI disappears, content shines
 * 3. Purposeful — Every element serves recovery
 * 4. Accessible — Works for everyone, especially in crisis
 * 5. Professional — Not "app-like", feels like a trusted tool
 */

// ============================================
// SPACING
// ============================================

/**
 * 8px Grid System
 * All spacing should be multiples of 8 for consistency
 */
export const SPACING = {
  /** 4px - Extra small (use sparingly) */
  xs: 4,
  /** 8px - Small gaps, icon padding */
  sm: 8,
  /** 12px - Compact spacing */
  md: 12,
  /** 16px - Default spacing, padding */
  lg: 16,
  /** 24px - Section gaps */
  xl: 24,
  /** 32px - Major sections */
  '2xl': 32,
  /** 40px - Page margins */
  '3xl': 40,
  /** 48px - Large gaps */
  '4xl': 48,
  /** 64px - Extra large spacing */
  '5xl': 64,
} as const;

/**
 * Component-specific spacing
 */
export const COMPONENT_SPACING = {
  /** Card internal padding */
  cardPadding: SPACING.lg,
  /** Section margin bottom */
  sectionMargin: SPACING.xl,
  /** List item gap */
  listGap: SPACING.md,
  /** Input field padding */
  inputPadding: SPACING.lg,
  /** Button padding horizontal */
  buttonPaddingX: SPACING.xl,
  /** Button padding vertical */
  buttonPaddingY: SPACING.md,
  /** Screen horizontal padding */
  screenPaddingX: SPACING.lg,
  /** Screen vertical padding */
  screenPaddingY: SPACING.xl,
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

/**
 * Font sizes following modular scale (1.25 ratio)
 * Using system fonts for maximum readability
 */
export const FONT_SIZES = {
  /** 12px - Captions, timestamps */
  xs: 12,
  /** 14px - Secondary text, metadata */
  sm: 14,
  /** 16px - Body text (base) */
  base: 16,
  /** 18px - Large body, emphasis */
  lg: 18,
  /** 20px - Subtitles, card titles */
  xl: 20,
  /** 24px - Section headers */
  '2xl': 24,
  /** 30px - Page titles */
  '3xl': 30,
  /** 36px - Hero text */
  '4xl': 36,
  /** 48px - Display text */
  '5xl': 48,
} as const;

/**
 * Line heights for comfortable reading
 * 1.5-1.6 for body text as specified in design guidelines
 */
export const LINE_HEIGHTS = {
  /** Tight - headings */
  tight: 1.25,
  /** Snug - subheadings */
  snug: 1.375,
  /** Normal - body text */
  normal: 1.5,
  /** Relaxed - long-form content */
  relaxed: 1.625,
  /** Loose - maximum readability */
  loose: 1.75,
} as const;

/**
 * Font weights
 */
export const FONT_WEIGHTS = {
  /** Regular body text */
  normal: '400',
  /** Slightly emphasized */
  medium: '500',
  /** Strong emphasis */
  semibold: '600',
  /** Headings, buttons */
  bold: '700',
} as const;

/**
 * Typography presets
 */
export const TYPOGRAPHY = {
  /** Hero/Display text */
  display: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  /** Page titles */
  h1: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  /** Section headers */
  h2: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.snug,
  },
  /** Card titles */
  h3: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.snug,
  },
  /** Subtitles */
  h4: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.normal,
  },
  /** Body text */
  body: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  /** Large body */
  bodyLarge: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  /** Small text */
  small: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  /** Captions */
  caption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  /** Button text */
  button: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.tight,
  },
} as const;

// ============================================
// COLORS
// ============================================

/**
 * Muted color palette with high contrast for readability
 * Following the design guideline of "muted palette, high contrast"
 */
export const COLORS = {
  // Primary - Blue (trust, calm, recovery)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main primary
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Secondary - Teal (growth, healing)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488', // Main secondary
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  // Surface - Neutral grays
  surface: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Semantic colors
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#166534',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#92400e',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#991b1b',
  },
  // Special colors for keytags
  keytags: {
    white: '#ffffff',
    orange: '#f97316',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    moonlight: '#e2e8f0', // Silver/gray for 1 year
    gray: '#6b7280',
    black: '#1f2937',
  },
} as const;

/**
 * Semantic color mappings for light/dark modes
 */
export const SEMANTIC_COLORS = {
  light: {
    background: COLORS.surface[50],
    foreground: COLORS.surface[900],
    card: '#ffffff',
    cardForeground: COLORS.surface[900],
    muted: COLORS.surface[100],
    mutedForeground: COLORS.surface[500],
    border: COLORS.surface[200],
    primary: COLORS.primary[600],
    primaryForeground: '#ffffff',
    secondary: COLORS.secondary[600],
    secondaryForeground: '#ffffff',
  },
  dark: {
    background: COLORS.surface[900],
    foreground: COLORS.surface[100],
    card: COLORS.surface[800],
    cardForeground: COLORS.surface[100],
    muted: COLORS.surface[800],
    mutedForeground: COLORS.surface[400],
    border: COLORS.surface[700],
    primary: COLORS.primary[500],
    primaryForeground: '#ffffff',
    secondary: COLORS.secondary[500],
    secondaryForeground: '#ffffff',
  },
} as const;

/**
 * Journal editor specific colors (Apple Notes style)
 */
export const JOURNAL_COLORS = {
  light: {
    /** Warm, paper-like background */
    background: '#FDFBF7',
    /** Soft text color for long-form reading */
    text: '#1C1917',
    /** Placeholder/hint text */
    placeholder: '#A8A29E',
  },
  dark: {
    /** Dark mode journal background */
    background: '#1C1C1E',
    /** Light text for dark mode */
    text: '#F5F5F4',
    /** Dark mode placeholder */
    placeholder: '#57534E',
  },
} as const;

// ============================================
// TOUCH TARGETS
// ============================================

/**
 * Touch target sizes for accessibility
 * Minimum 44px as per iOS/Android guidelines
 */
export const TOUCH_TARGETS = {
  /** Minimum touch target size (44x44) */
  minimum: 44,
  /** Comfortable touch target (48x48) */
  comfortable: 48,
  /** Large touch target for important actions */
  large: 56,
  /** Extra large for crisis/emergency buttons */
  extraLarge: 64,
} as const;

// ============================================
// BORDERS & RADIUS
// ============================================

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  /** No radius */
  none: 0,
  /** Subtle rounding (4px) */
  sm: 4,
  /** Default rounding (8px) */
  md: 8,
  /** Card rounding (12px) */
  lg: 12,
  /** Large rounding (16px) */
  xl: 16,
  /** Extra large rounding (24px) */
  '2xl': 24,
  /** Pill shape */
  full: 9999,
} as const;

/**
 * Border widths
 */
export const BORDER_WIDTH = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

// ============================================
// SHADOWS
// ============================================

/**
 * Shadow definitions (use sparingly per design guidelines)
 * "Not drop shadows on everything"
 */
export const SHADOWS = {
  /** No shadow */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Subtle shadow for cards */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Medium shadow for elevated elements */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  /** Larger shadow for modals, FABs */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// ============================================
// ANIMATIONS
// ============================================

/**
 * Animation durations (subtle, functional, never decorative)
 */
export const ANIMATION_DURATIONS = {
  /** Instant feedback (100ms) */
  instant: 100,
  /** Quick transitions (200ms) */
  fast: 200,
  /** Standard transitions (300ms) */
  normal: 300,
  /** Slow, deliberate animations (500ms) */
  slow: 500,
} as const;

/**
 * Common easing curves
 */
export const EASING = {
  /** Standard ease out */
  out: 'ease-out',
  /** Ease in-out for symmetric animations */
  inOut: 'ease-in-out',
  /** Spring-like motion */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ============================================
// Z-INDEX
// ============================================

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  /** Base layer */
  base: 0,
  /** Above content (cards) */
  elevated: 10,
  /** Dropdown menus */
  dropdown: 20,
  /** Sticky headers */
  sticky: 30,
  /** Overlays, backdrops */
  overlay: 40,
  /** Modal dialogs */
  modal: 50,
  /** Crisis button FAB */
  fab: 60,
  /** Toast notifications */
  toast: 70,
  /** Maximum (dev tools) */
  max: 100,
} as const;

// ============================================
// EXPORTS
// ============================================

export const designTokens = {
  spacing: SPACING,
  componentSpacing: COMPONENT_SPACING,
  fontSizes: FONT_SIZES,
  lineHeights: LINE_HEIGHTS,
  fontWeights: FONT_WEIGHTS,
  typography: TYPOGRAPHY,
  colors: COLORS,
  semanticColors: SEMANTIC_COLORS,
  journalColors: JOURNAL_COLORS,
  touchTargets: TOUCH_TARGETS,
  borderRadius: BORDER_RADIUS,
  borderWidth: BORDER_WIDTH,
  shadows: SHADOWS,
  animationDurations: ANIMATION_DURATIONS,
  easing: EASING,
  zIndex: Z_INDEX,
} as const;

export default designTokens;

