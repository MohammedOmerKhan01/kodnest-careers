/**
 * KodNest Premium Build System - Design Tokens
 * Type-safe design system tokens for TypeScript/React
 */

export const colors = {
  background: '#F7F6F3',
  textPrimary: '#111111',
  textSecondary: '#5A5A5A',
  accent: '#8B0000',
  success: '#2D5016',
  warning: '#8B6914',
  border: '#D4D2CC',
  surface: '#FFFFFF',
} as const;

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
} as const;

export const typography = {
  fontSerif: "'Crimson Pro', 'Georgia', serif",
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontMono: "'SF Mono', 'Monaco', 'Courier New', monospace",
  
  bodySize: '16px',
  bodyLineHeight: '1.7',
  maxWidth: '720px',
} as const;

export const interaction = {
  transitionSpeed: '180ms',
  transitionTiming: 'ease-in-out',
  borderRadius: '2px',
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Interaction = typeof interaction;
