const tw = require('@butopen/design-system/tailwind.config');

module.exports = {
  mode: 'jit',
  prefix: '',
  important: true,
  content: ['./src/**/*.{html,ts,scss,js,md}'],
  theme: {
    extend: {
      ...tw.theme.extend,
      colors: {
        ...tw.theme.extend.colors,
        ntp: 'var(--nt-primary-color)',
        nts: 'var(--nt-secondary-color)',
        'nt-50': '#dff3ff',
        'nt-100': '#afe5ff',
        'nt-200': '#67ccff',
        'nt-300': '#24b4ff',
        'nt-400': '#0097e4',
        'nt-500': '#007cbb',
        'nt-600': '#0475b0',
        'nt-700': '#0c6088',
        'nt-800': '#00476b',
        'nt-900': '#003c59'
      },
      scale: {
        200: '2',
        300: '3'
      }
    }
  },
  variants: {
    extend: {}
  }
};
