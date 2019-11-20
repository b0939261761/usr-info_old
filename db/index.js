const organizations = require('./organizations');
const proxies = require('./proxies');

module.exports = {
  ...organizations,
  ...proxies
};
