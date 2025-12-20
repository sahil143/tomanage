import { Platform, ViewStyle } from 'react-native';

interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles that work on both native and web.
 * On web, converts to boxShadow. On native, uses platform-specific shadow props.
 */
export function createShadow(shadow: ShadowStyle): ViewStyle {
  if (Platform.OS === 'web') {
    const {
      shadowColor = '#000',
      shadowOffset = { width: 0, height: 2 },
      shadowOpacity = 0.25,
      shadowRadius = 4,
    } = shadow;

    // Convert to CSS boxShadow format: offsetX offsetY blurRadius spreadRadius color
    const offsetX = shadowOffset.width;
    const offsetY = shadowOffset.height;
    const blurRadius = shadowRadius;

    // Convert hex color and opacity to rgba
    const rgba = hexToRgba(shadowColor, shadowOpacity);

    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px 0px ${rgba}`,
    } as ViewStyle;
  }

  // On native platforms, return the original shadow props
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: shadow.elevation,
  };
}

/**
 * Converts hex color to rgba with opacity
 */
function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Common shadow presets
export const shadows = {
  small: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }),
  medium: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  large: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }),
  glow: createShadow({
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }),
};
