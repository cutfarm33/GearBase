/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./screens/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #14B8A6 33%, #22D3EE 66%, #38BDF8 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(20,184,166,0.05) 50%, rgba(34,211,238,0.05) 100%)',
        'gradient-glow': 'radial-gradient(circle at top right, rgba(16,185,129,0.3), transparent 50%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(20,184,166,0.2) 25%, rgba(34,211,238,0.2) 50%, rgba(56,189,248,0.2) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 185, 129, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(20, 184, 166, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-sky': '0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
