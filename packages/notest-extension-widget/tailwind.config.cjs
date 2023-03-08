
module.exports = {
  mode: "jit",
  important: true,
  content: [
    './src/**/*.svelte',
      './src/**/*.scss',
      './src/*.scss'
  ],
  theme: {
    extend: {
      colors: {
        'nt-50': '#deebf1',
        'nt-100': '#badaea',
        'nt-200': '#8dc6e3',
        'nt-300': '#6ebbe1',
        'nt-400': '#379cda',
        'nt-500': '#0097e4',
        'nt-600': '#0171ad',
        'nt-700': '#015986',
        'nt-800': '#004364',
        'nt-900': '#00202f',
        'bos':'var(--nt-secondary-color)',
        'bop':'var(--nt-primary-color)',
      },
      scale: {
        200: "2",
        300: "3",
      },
    },
  },
};
