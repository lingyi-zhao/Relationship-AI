export const theme = {
    colors: {
        primary: '#FF6B6B', // Soft Coral - warm & engaging for dating/relationships
        primaryLight: '#FF8E8E',
        primaryDark: '#E55555',
        secondary: '#4ECDC4', // Soft Teal - calming for healing
        secondaryLight: '#6EDDD5',
        secondaryDark: '#3AB5AD',
        background: '#FAFBFC', // Very light gray/white with subtle warmth
        card: '#FFFFFF',
        cardElevated: '#FFFFFF',
        text: '#1A1F2E', // Deep, rich dark
        textLight: '#6B7280', // Softer gray
        textLighter: '#9CA3AF',
        accent: '#FFE66D', // Soft Yellow
        accentLight: '#FFF4B3',
        error: '#FF7675',
        success: '#55EFC4',
        successLight: '#7FF5D4',
        border: '#E5E7EB', // Softer border
        shadow: '#1A1F2E',
        overlay: 'rgba(26, 31, 46, 0.4)',
        gradient: {
            primary: ['#FF6B6B', '#FF8E8E'],
            secondary: ['#4ECDC4', '#6EDDD5'],
            accent: ['#FFE66D', '#FFF4B3'],
            success: ['#55EFC4', '#7FF5D4'],
            warm: ['#FFF5F5', '#FFFFFF'],
            cool: ['#F0FDFA', '#FFFFFF'],
        },
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },
    borderRadius: {
        xs: 6,
        s: 12,
        m: 16,
        l: 24,
        xl: 32,
        circle: 9999,
    },
    typography: {
        h1: { fontSize: 36, fontWeight: '800', lineHeight: 44, letterSpacing: -1 },
        h2: { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5 },
        h3: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
        h4: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
        body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
        bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400' },
        caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
        captionSmall: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
        button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
        buttonLarge: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
    },
    shadows: {
        soft: {
            shadowColor: '#1A1F2E',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
        },
        medium: {
            shadowColor: '#1A1F2E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 4,
        },
        large: {
            shadowColor: '#1A1F2E',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
        },
        card: {
            shadowColor: '#1A1F2E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
        },
    },
};
