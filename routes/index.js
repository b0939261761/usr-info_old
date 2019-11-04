const routes = require('express').Router();

routes.get('', (req, res) => res.end('Welcome'));
routes.use('/proxies', require('./proxies'));
routes.use('/organizations', require('./organizations'));
routes.use('/balance', require('./balance'));

module.exports = routes;
