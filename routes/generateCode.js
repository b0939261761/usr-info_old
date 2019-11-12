const routes = require('express').Router();
const { generateCode } = require('../utils/code');

routes.get('', (req, res) => res.send(generateCode(req.query.code)));

module.exports = routes;
