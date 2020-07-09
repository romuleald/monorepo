import { create } from '@storybook/theming';
const logo = require('./logo.png');

export default create({
  base: 'light',
  colorPrimary: '#00008f',
  brandTitle: 'Axa',
  brandImage: logo,
});
