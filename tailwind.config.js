module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // Extra small devices (phones)
        // Tailwind's default sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) are usually good
      },
      spacing: {
        // Define common spacing units for padding, margin, width, height for consistency
        // Example: 'tap-target': '44px', // For minimum touch target size
      },
      fontSize: {
        // Define responsive font sizes if needed, beyond html base size adjustments
        // Example: 'xs': '0.75rem', 'sm': '0.875rem', 'base': '1rem', 'lg': '1.125rem', 'xl': '1.25rem',
      }
    },
  },
  plugins: [],
};
