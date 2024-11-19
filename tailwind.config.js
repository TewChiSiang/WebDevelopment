/** @type {import("tailwindcss").Config} */
export default {
  important: true,
  prefix: "tw-",
  content: [
      "./resources/**/*.blade.php",
      "./resources/**/*.js",
      "./resources/**/*.jsx",
      "./index.html", "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
      extend: {},
      screens: {
          "sm": "576px",
          "md": "768px",
          "lg": "992px",
          "xl": "1200px",
          "2xl": "1600px",
      }
  },
  corePlugins: {
      preflight: false,
  },
  plugins: [],
};

