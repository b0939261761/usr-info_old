const routes = require('express').Router();

routes.get('', (req, res) => res.end('UsrInfo'));
routes.use('/proxies', require('./proxies.cjs'));
routes.use('/organizations', require('./organizations.cjs'));
routes.use('/balance', require('./balance.cjs'));

module.exports = routes;
