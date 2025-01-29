/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in the src directory
  ],
  theme: {
    extend: {
      colors: {
        primary: '#48BB78', // Custom color for primary
        secondary: '#F7FAFC', // Custom secondary color
        accent: '#3182CE', // Accent color
        textDark: '#2D3748', // Text dark
        textLight: '#E2E8F0', // Text light
      },
    },
  },
  plugins: [],
};
