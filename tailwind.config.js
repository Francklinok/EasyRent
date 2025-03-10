
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")], // Ajoute ce preset !
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}", // Assure-toi que components/ est inclus
    "./screens/**/*.{js,jsx,ts,tsx}", // Ajoute aussi screens si tu en as
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};















// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./App.{js,jsx,ts,tsx}",
//     "./app/**/*.{js,jsx,ts,tsx}",
//     "./components/**/*.{js,jsx,ts,tsx}",
//     "./screens/**/*.{js,jsx,ts,tsx}"
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
//   presets: [require("nativewind/tailwind/native")], // Ajoute cette ligne
// };
