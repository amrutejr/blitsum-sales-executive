/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': {
                    DEFAULT: '#2c236e', // Base Background
                    dark: '#19143f',   // Gradient End
                },
                'text': {
                    white: '#FFFFFF',
                    'white-92': 'rgba(255, 255, 255, 0.92)',
                    'white-78': 'rgba(255, 255, 255, 0.78)',
                    'white-75': 'rgba(255, 255, 255, 0.75)',
                    'white-60': 'rgba(255, 255, 255, 0.60)',
                }
            },
            fontFamily: {
                plaster: ['Inter', ...defaultTheme.fontFamily.sans], // Strict default
            },
            spacing: {
                '18': '4.5rem', // 72px
                '28': '7rem',   // 112px
                '24': '6rem',   // 96px
            },
            maxWidth: {
                'hero': '1240px',
            },
            animation: {
                'breathe': 'breathe 6s ease-in-out infinite',
                'pulse-dot': 'pulse-dot 2s infinite',
                'wave': 'wave 1.2s ease-in-out infinite',
                'cursor-move': 'cursor-move 4s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 255, 255, 0.05)' },
                    '50%': { transform: 'scale(1.02)', boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3), 0 0 45px rgba(255, 255, 255, 0.1)' },
                },
                'pulse-dot': {
                    '0%': { transform: 'scale(0.95)', opacity: '0.7' },
                    '50%': { transform: 'scale(1.1)', opacity: '1' },
                    '100%': { transform: 'scale(0.95)', opacity: '0.7' },
                },
                wave: {
                    '0%, 100%': { transform: 'scaleY(1)', opacity: '0.5' },
                    '50%': { transform: 'scaleY(1.5)', opacity: '1' },
                },
                'cursor-move': {
                    '0%': { transform: 'translate(0, 0)', opacity: '0' },
                    '20%': { opacity: '1' },
                    '50%': { transform: 'translate(-40px, -60px)' },
                    '100%': { transform: 'translate(0, 0)', opacity: '0' },
                }
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(180deg, #2c236e 0%, #19143f 100%)',
                'radial-glow': 'radial-gradient(circle at 72% 42%, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 48%)',
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}
