const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools');
const { getProxies, addProxies } = require('../services/db');

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getProxies())));

routes.post('', catchAsyncRoute(async (req, res) => {
  await addProxies(req.body.servers);
  res.json(await getProxies());
}));

module.exports = routes;
