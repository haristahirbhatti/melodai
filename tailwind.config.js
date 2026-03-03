/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#f97316',
          red: '#ef4444',
          pink: '#ec4899',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          1: '#111111',
          2: '#141414',
          3: '#1a1a1a',
          4: '#222222',
          border: '#1e1e1e',
          border2: '#2a2a2a',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 0.8s ease-in-out infinite alternate',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        wave: { from: { transform: 'scaleY(0.3)' }, to: { transform: 'scaleY(1)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #f97316, #ef4444, #ec4899)',
        'brand-gradient-h': 'linear-gradient(90deg, #f97316, #ef4444)',
      },
    },
  },
  plugins: [],
}
