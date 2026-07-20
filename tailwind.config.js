/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // fontFamily: {
      //   sans: ['"IBM Plex Sans", sans-serif'],
      // },
      colors: {
        pink: {
          light: '#fff1f5',
          lighter: '#fde6eb',
          medium: '#f8c6cd',
        },
        gray: {
          bg: '#f1f3f8',
          header: '#ebecef',
        },
      },
      borderRadius: {
        '4xl': '30px',
      },
    },
  },
  plugins: [],
}
