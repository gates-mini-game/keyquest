const path = require('path');

module.exports = {
  reactStrictMode: true,
   webpack: (config) => {
    config.resolve.modules.push(path.join(__dirname, 'public'));
    return config;
  },
};
