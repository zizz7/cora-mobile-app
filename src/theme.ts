/**
 * Unified Design System — Cora Cora Mobile App
 * Single source of truth for colors, radii, shadows, and animation tokens.
 */
import { Platform } from 'react-native';

// ─── Colors ──────────────────────────────────────────────
export const Colors = {
    // Core palette
    primaryDark: '#0A1628',
    brandTeal: '#00C9A7',
    brandTealLight: 'rgba(0, 201, 167, 0.15)',
    accentPurple: '#7B61FF',
    accentPurpleLight: 'rgba(123, 97, 255, 0.15)',

    // Surfaces
    surface: '#F4F6FA',
    card: '#FFFFFF',

    // Status
    danger: '#FF5C5C',
    dangerLight: '#FEE2E2',
    success: '#00C9A7',
    successLight: '#D1FAE5',
    warning: '#F9A03F',
    warningLight: '#FEF3C7',

    // Text
    textPrimary: '#0A1628',
    textSecondary: '#8A94A6',
    textTertiary: '#B0B8C9',

    // Borders & Dividers
    border: '#E8ECF2',
    divider: '#F0F2F5',

    // Tab bar
    tabActive: '#0A1628',
    tabInactive: '#B0B8C9',
    tabActiveBg: 'rgba(0, 201, 167, 0.12)',

    // Gradients (as tuples for LinearGradient)
    gradientTeal: ['#00C9A7', '#0A1628'] as const,
    gradientPurple: ['#7B61FF', '#5B3FD6'] as const,
    gradientHero: ['#0A1628', '#162844'] as const,
} as const;

// ─── Typography ──────────────────────────────────────────
export const Typography = {
    // Display — used for large headings and hero amounts
    displayLarge: {
        fontSize: 36,
        fontWeight: '800' as const,
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    displayMedium: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: Colors.textPrimary,
        letterSpacing: -0.3,
    },
    // Headings
    h1: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: Colors.textPrimary,
    },
    h2: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.textPrimary,
    },
    h3: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.textPrimary,
    },
    // Body
    bodyLarge: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: Colors.textPrimary,
        lineHeight: 24,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: 12,
        fontWeight: '500' as const,
        color: Colors.textSecondary,
    },
    // Labels
    label: {
        fontSize: 10,
        fontWeight: '700' as const,
        color: Colors.textSecondary,
        letterSpacing: 0.8,
        textTransform: 'uppercase' as const,
    },
    // Numbers — monospaced feel for financial data
    number: {
        fontSize: 20,
        fontWeight: '800' as const,
        color: Colors.textPrimary,
        fontVariant: ['tabular-nums'] as ('tabular-nums')[],
    },
    numberLarge: {
        fontSize: 36,
        fontWeight: '800' as const,
        color: Colors.textPrimary,
        fontVariant: ['tabular-nums'] as ('tabular-nums')[],
    },
} as const;

// ─── Corner Radii ────────────────────────────────────────
export const Radii = {
    card: 20,
    inner: 12,
    pill: 100,
    avatar: 100,
    button: 14,
} as const;

// ─── Shadows ─────────────────────────────────────────────
export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    cardHover: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
    },
    float: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
    },
    tabBar: {
        shadowColor: '#0A1628',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 16,
    },
    hero: {
        shadowColor: '#00C9A7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
} as const;

// ─── Animation Constants ─────────────────────────────────
export const Motion = {
    // Spring physics config for react-native-reanimated
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
    },
    // Stagger delay between children (ms)
    staggerDelay: 40,
    // Press scale
    pressScale: 0.97,
    pressScaleDuration: 120,
    // Page transition duration (ms)
    transitionDuration: 300,
    // Count-up animation duration (ms)
    countUpDuration: 800,
    // Sparkline draw duration (ms)
    sparklineDrawDuration: 800,
} as const;

// ─── Spacing ─────────────────────────────────────────────
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    screenPadding: 20,
    // Bottom padding for scrollable content (clears floating tab bar)
    bottomSafe: 100,
    // Tab bar
    tabBarHeight: 68,
    tabBarBottom: Platform.OS === 'android' ? 15 : 0,
    tabBarHorizontal: 20,
} as const;

// ─── Common Styles ───────────────────────────────────────
export const CommonStyles = {
    screenContainer: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: Radii.card,
        padding: Spacing.lg,
        ...Shadows.card,
    },
    pillBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: Radii.pill,
    },
} as const;
