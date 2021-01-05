const organizations = require('./organizations.cjs');
const proxies = require('./proxies.cjs');

module.exports = {
  ...organizations,
  ...proxies
};
