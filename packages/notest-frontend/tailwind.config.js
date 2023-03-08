const tw = require('@butopen/design-system/tailwind.config');

module.exports = {
  mode: 'jit',
  important: true,
  content: ['./src/styles.scss', './src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      ...tw.theme.extend,
      colors: {
        ...tw.theme.extend.colors,
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
        'nt-secondary': '#ff4d00',
        'nt-secondary-light': '#ffa3a3'
      }
    }
  },
  plugins: []
};
