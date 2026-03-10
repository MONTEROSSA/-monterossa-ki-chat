import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        // Monterossa Custom Colors
                        'monterossa-dark': '#0a1628',
                        'monterossa-dark-light': '#0f2035',
                        'monterossa-dark-lighter': '#142842',
                        'monterossa-cyan': '#22d3bb',
                        'monterossa-cyan-dark': '#1ab3a0',
                        'monterossa-cyan-light': '#4ee0cd',
                        'monterossa-orange': '#f97316',
                        'monterossa-orange-dark': '#ea580c',
                        'monterossa-orange-light': '#fb923c',
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'float': 'float 6s ease-in-out infinite',
                        'glow': 'glow 2s ease-in-out infinite alternate',
                },
                keyframes: {
                        float: {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-10px)' },
                        },
                        glow: {
                                '0%': { boxShadow: '0 0 20px rgba(34, 211, 187, 0.3)' },
                                '100%': { boxShadow: '0 0 40px rgba(34, 211, 187, 0.6)' },
                        },
                },
                backgroundImage: {
                        'grid-pattern': 'linear-gradient(to right, rgba(34, 211, 187, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 187, 0.05) 1px, transparent 1px)',
                },
                backgroundSize: {
                        'grid': '40px 40px',
                },
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
