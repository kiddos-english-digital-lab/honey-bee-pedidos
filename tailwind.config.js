/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFCF7',
        butter: {
          50: '#FFFBEA',
          100: '#FFF9DF',
          200: '#FFF4CC',
          300: '#FBE8A3',
          500: '#E8C54E',
          700: '#8A6A12',
        },
        rose: {
          50: '#FDF6F9',
          100: '#FAEDF3',
          200: '#F3D6E2',
          300: '#E9B6CD',
          500: '#C4628C',
          700: '#8E3D60',
          900: '#5E2440',
        },
        cocoa: {
          50: '#F7F1EE',
          100: '#EDE1DA',
          200: '#D9C2B6',
          300: '#B99C8E',
          500: '#7E5A4A',
          600: '#664331',
          700: '#513326',
          800: '#3D2619',
          900: '#2A1A11',
        },
        honey: {
          300: '#F6C453',
          500: '#E0A11B',
          700: '#9A6A08',
        },
        sage: {
          100: '#E4EFE1',
          500: '#5E8C5A',
          700: '#3F6B3C',
        },
        amber: {
          100: '#FDF0D5',
          500: '#B7791F',
          700: '#8A5A12',
        },
        brick: {
          100: '#F8E1DC',
          500: '#B4493A',
          700: '#8E2F23',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'none' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)' },
          '60%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in-right': 'slide-in-right 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        pop: 'pop 320ms ease-out',
      },
    },
  },
  plugins: [],
};
