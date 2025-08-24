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
        // Sunset Gradient Theme Colors
        sunset: {
          coral: '#FF7E5F',
          peach: '#FEB47B',
          textDark: '#2C2C2C',
          textBody: '#444444',
          textMuted: '#6E6E6E',
          linkCoral: '#FF6F61',
          linkHover: '#E55B50',
          buttonFrom: '#FF5E62',
          buttonTo: '#FF9966',
          cardCream: '#FFF5EE',
          cardPeach: '#FFE9DC',
          border: '#FFFFFF',
          shadow: 'rgba(255, 100, 70, 0.2)',
        },
        // Cyberpunk Neon Theme Colors
        cyberpunk: {
          background: '#0D0D0D',
          cardDark: '#1A1A1A',
          cardCharcoal: '#1E1E1E',
          textCyan: '#00F5FF',
          textGreen: '#39FF14',
          textBody: '#D1D5DB',
          textMuted: '#9CA3AF',
          linkMagenta: '#FF00FF',
          borderCyan: 'rgba(0, 245, 255, 0.3)',
          borderMagenta: 'rgba(255, 0, 255, 0.3)',
          glowCyan: 'rgba(0, 245, 255, 0.6)',
          glowGreen: 'rgba(57, 255, 20, 0.6)',
          glowMagenta: 'rgba(255, 0, 255, 0.6)',
        },
        // GitHub Focus Theme Colors
        github: {
          background: '#0D1117',
          card: '#161B22',
          cardAlt: '#1C2128',
          textHeading: '#F0F6FC',
          textBody: '#C9D1D9',
          textMuted: '#8B949E',
          link: '#58A6FF',
          linkHover: '#1F6FEB',
          buttonPrimary: '#238636',
          buttonPrimaryHover: '#2EA043',
          buttonSecondary: '#30363D',
          buttonSecondaryHover: '#484F58',
          border: '#30363D',
          icon: '#F0F6FC',
          iconAccent: '#238636',
          iconMuted: '#8B949E',
        },
        // Minimalist Light Theme Colors
        minimalist: {
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
          card: '#FFFFFF',
          cardAlt: '#F3F4F6',
          textHeading: '#111827',
          textBody: '#374151',
          textMuted: '#6B7280',
          link: '#2563EB',
          linkHover: '#1E40AF',
          buttonPrimary: '#2563EB',
          buttonPrimaryHover: '#1D4ED8',
          buttonSecondary: '#FFFFFF',
          buttonSecondaryBorder: '#D1D5DB',
          border: '#E5E7EB',
          icon: '#374151',
          iconAccent: '#2563EB',
          iconMuted: '#9CA3AF',
          shadow: '0 2px 6px rgba(0,0,0,0.08)',
        }
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)',
        'cyberpunk-gradient': 'linear-gradient(90deg, #00F5FF, #FF00FF)',
      },
      boxShadow: {
        'sunset-glow': '0 8px 30px rgba(255, 100, 70, 0.2)',
        'cyberpunk-cyan': '0 0 20px rgba(0, 245, 255, 0.3), 0 0 40px rgba(0, 245, 255, 0.1)',
        'cyberpunk-magenta': '0 0 20px rgba(255, 0, 255, 0.3), 0 0 40px rgba(255, 0, 255, 0.1)',
        'cyberpunk-card': '0 0 15px rgba(0, 245, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.1)',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 1.5s infinite alternate',
      },
      utilities: {
        '.glassmorphic': {
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        }
      },
      keyframes: {
        'neon-pulse': {
          '0%': { 
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.3), 0 0 40px rgba(0, 245, 255, 0.1)',
            textShadow: '0 0 10px rgba(0, 245, 255, 0.6)'
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(0, 245, 255, 0.5), 0 0 60px rgba(0, 245, 255, 0.2)',
            textShadow: '0 0 15px rgba(0, 245, 255, 0.8)'
          },
        },
        'neon-flicker': {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '0.99',
            filter: 'drop-shadow(0 0 1px rgba(0, 245, 255, 0.7)) drop-shadow(0 0 15px rgba(0, 245, 255, 0.9)) drop-shadow(0 0 25px rgba(0, 245, 255, 0.8))'
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
            filter: 'none'
          }
        }
      }
    },
  },
  plugins: [],
}
