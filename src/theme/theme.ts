import { Easing } from 'react-native';

export const theme = {
    colors: {
        // Primary Palette
        white: '#FFFFFF',
        orange: '#FFA16B',
        pink: '#F89ABA',
        teal: '#00C4B3',
        blue: '#97CAEB',
        purple: '#7B61FF', // ⚠️ DEPRECATED in design system v2 — avoid new usage
        black: '#000000',

        // Derived Semantic Colors
        bgPage: '#F4F7F9',
        bgDark: '#0A1A1F',
        bgDarkMid: '#0D2B30',
        bgDarkDeep: '#0A1F2A',
        textPrimary: '#0A1A1F',
        textSecondary: '#8A94A6',
        textTertiary: '#B8C0CC',
        borderLight: '#E8EDF2',
        borderMid: '#D1D9E0',
        surfaceCard: '#FFFFFF',
        danger: '#FF5C5C',

        // Transparent Variants (Calculated via rgba in RN, using object structure for clarity)
        transparent: {
            teal10: 'rgba(0, 196, 179, 0.10)',
            teal15: 'rgba(0, 196, 179, 0.15)',
            teal20: 'rgba(0, 196, 179, 0.20)',
            blue10: 'rgba(151, 202, 235, 0.10)',
            blue15: 'rgba(151, 202, 235, 0.15)',
            blue30: 'rgba(151, 202, 235, 0.30)',
            pink10: 'rgba(248, 154, 186, 0.10)',
            pink20: 'rgba(248, 154, 186, 0.20)',
        },
    },

    gradients: {
        sunset: ['#FFA16B', '#F89ABA'] as const,
        ocean: ['#00C4B3', '#97CAEB'] as const,
        dark: ['#0A1A1F', '#0D2B30', '#0A1F2A'] as const,
        heroWarm: ['#FFA16B', '#F89ABA'] as const,
        cardWarm: ['rgba(255,161,107,0.08)', 'rgba(248,154,186,0.08)'] as const,
    },

    fonts: {
        display: 'CormorantGaramond_700Bold',
        headingXl: 'CormorantGaramond_700Bold',
        headingL: 'Sora_600SemiBold',
        headingM: 'Sora_600SemiBold',
        headingS: 'Sora_600SemiBold',
        bodyL: 'DMSans_400Regular',
        bodyM: 'DMSans_400Regular',
        bodyS: 'DMSans_400Regular',
        label: 'DMSans_500Medium',
        button: 'Sora_600SemiBold',
        caption: 'DMSans_400Regular',
        amount: 'Sora_600SemiBold',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        pagePadding: 20,
        cardGap: 12,
    },

    radius: {
        pill: 100,
        xl: 24,
        lg: 20,
        md: 16,
        sm: 14,
        xs: 10,
        xxs: 6,
    },

    shadows: {
        level0: { shadowOpacity: 0, elevation: 0 },
        level1: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
        level2: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
        level3: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 6 },
        level4: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.20, shadowRadius: 48, elevation: 8 },
        tealGlow: { shadowColor: '#00C4B3', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8 },
        orangeGlow: { shadowColor: '#FFA16B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 8 },
    },

    animation: {
        spring: Easing.bezier(0.34, 1.56, 0.64, 1),
        smooth: Easing.bezier(0.4, 0, 0.2, 1),
        quick: Easing.bezier(0.2, 0, 0, 1),
    }
};
