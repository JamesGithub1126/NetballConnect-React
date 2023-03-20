const CracoAntDesignPlugin = require("craco-antd");

module.exports = {
    plugins: [
        {
            plugin: CracoAntDesignPlugin,
            options: {
                customizeTheme: {
                    "@primary-color": "#ff8237",
                    "@primary-1": "#ff8237",
                    "@primary-2": "#ff8237",
                    "@link-color": "#ff8237",
                    "@link-hover-color": "#ff8237",
                    "@link-active-color": "#ff8237",
                    "@height-base": "40px",
                    "@height-lg": "48px",
                    "@height-sm": "32px",
                    "@font-size-base": "15px",
                    "@btn-font-weight": 600,
                    "@btn-border-radius-base": "8px",
                },
            },
        },
    ],
};
