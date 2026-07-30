/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#0FB86F',
        primaryDark: '#0A8B53',
        secondary: '#00E58F',
        lightBg: '#F8FDF9',
        card: '#FFFFFF',
        dark: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
      },
      boxShadow: {
        'card': '0 4px 30px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.10)',
        'premium': '0 10px 40px rgba(15, 184, 111, 0.15)',
        'nav': '0 -4px 30px rgba(0,0,0,0.08)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
