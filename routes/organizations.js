const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools');
const { getOrganizations } = require('../services/db');

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getOrganizations(req.query))));

module.exports = routes;
