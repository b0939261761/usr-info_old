const organizations = require('./organizations');
const proxies = require('./proxies');
const holidays = require('./holidays');

module.exports = {
  ...organizations,
  ...proxies,
  ...holidays
};
