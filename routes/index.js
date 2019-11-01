const routes = require('express').Router();

routes.get('', (req, res) => res.end('Welcome'));
routes.use('/proxies', require('./proxies'));

module.exports = routes;
