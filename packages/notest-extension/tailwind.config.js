const tw = require('@butopen/design-system/tailwind.config');

module.exports = {
  mode: 'jit',
  prefix: '',
  content: ['./src/**/*.{html,ts,scss,css,js,md}'],
  theme: {
    extend: {
      ...tw.theme.extend,
      colors: {
        ...tw.theme.extend.colors,
        ntp: 'var(--nt-primary-color)',
        nts: 'var(--nt-secondary-color)'
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
