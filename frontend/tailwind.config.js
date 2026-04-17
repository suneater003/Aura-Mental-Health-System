// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode switching
  theme: {
    extend: {
      colors: {
        garden: {
          light: {
            background: '#FDF6F0',
            dutchWhite: '#F5E8D3',
            coffee: '#A0522D',
          },
          dark: {
            background: '#1B1B1B',
            eerieBlack: '#1B1B1B',
            pumpkin: '#FF7518',
          },
        },
      },
      backgroundImage: {
        'sunlit-sanctuary': 'linear-gradient(135deg, #FDF6F0 0%, #F5E8D3 100%)',
        'nocturnal-garden': 'linear-gradient(135deg, #1B1B1B 0%, #080C14 100%)',
      }
    },
  },
  plugins: [],
}