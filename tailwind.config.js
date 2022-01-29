const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // gray: colors.slate,
        // gray: colors.zinc,
        gray: colors.neutral,
        // gray: colors.stone,
      }
    },
  },
  plugins: [],
}
