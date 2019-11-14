const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools');
const { getOrganizations, setOrganization } = require('../services/db');

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getOrganizations(req.query))));

routes.post('/fix', catchAsyncRoute(async (req, res) => {
  const organizations = await getOrganizations(req.query);
  // eslint-disable-next-line no-restricted-syntax
  for (const organization of organizations) {
    // eslint-disable-next-line no-await-in-loop
    await setOrganization(organization);
  }
  res.json(await getOrganizations(req.query));
}));

module.exports = routes;
