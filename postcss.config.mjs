const config = {
  darkMode: ['class'],
  plugins: {
    '@tailwindcss/postcss': {},
  },
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color (blue)
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },

        // Background / foreground
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Cards
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },

        // Muted
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },

        // Border / input
        border: 'var(--border)',
        input: 'var(--input)',

        // Accent
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },

        // Premium (green)
        premium: {
          DEFAULT: 'var(--premium)',
          foreground: 'var(--premium-foreground)',
        },

        // OB-tillägg (purple)
        ob: {
          DEFAULT: 'var(--ob)',
          foreground: 'var(--ob-foreground)',
        },

        // Error / destructive
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
      },

      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
};

export default config;
