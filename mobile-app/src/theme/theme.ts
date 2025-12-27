export const theme = {
    colors: {
        background: '#0F0F13', // Deep dark
        surface: '#1C1C1E',
        surfaceGlass: 'rgba(28, 28, 30, 0.65)',
        primary: '#0A84FF', // Apple Blue
        secondary: '#30D158', // Apple Green
        destructive: '#FF453A', // Apple Red
        text: '#FFFFFF',
        textSecondary: 'rgba(235, 235, 245, 0.6)', // 60%
        textTertiary: 'rgba(235, 235, 245, 0.3)', // 30%
        overlay: 'rgba(0,0,0,0.5)',
        border: 'rgba(255,255,255,0.1)',
        glassBorder: 'rgba(255,255,255,0.15)',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        s: 10,
        m: 18,
        l: 28,
        xl: 40,
        round: 9999,
    },
    typography: {
        header: {
            fontSize: 34,
            fontWeight: '700' as '700',
            color: '#FFF',
            letterSpacing: 0.37,
        },
        title: {
            fontSize: 22,
            fontWeight: '600' as '600',
            color: '#FFF',
            letterSpacing: 0.35,
        },
        body: {
            fontSize: 17,
            fontWeight: '400' as '400',
            color: '#FFF',
            letterSpacing: -0.41,
        },
        caption: {
            fontSize: 13,
            fontWeight: '400' as '400',
            color: 'rgba(235, 235, 245, 0.6)',
            letterSpacing: -0.08,
        },
    },
};
