const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools');
const toSendFile = require('../organization/toSendFile');

// --------------------------------------------

routes.get('/report', catchAsyncRoute(async (req, res) => {
  await toSendFile(req.query);
  res.send('Отправлено');
}));

module.exports = routes;
