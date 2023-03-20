const CracoAntDesignPlugin = require('craco-antd');

module.exports = {
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#861197',
          '@primary-1': '#f86ad5',
          '@primary-2': '#eb0cb5',
          '@link-color': '#861197',
          '@link-hover-color': '#01006d',
          '@link-active-color': '#01006d',
          '@height-base': '40px',
          '@height-lg': '48px',
          '@height-sm': '32px',
          '@font-size-base': '15px',
          '@btn-font-weight': 600,
          '@btn-border-radius-base': '8px',
        },
      },
    },
  ],
};
