const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools');
const { getCaptchaBalance } = require('../services/captcha');

routes.get('', catchAsyncRoute(async (req, res) => res.send(await getCaptchaBalance())));

module.exports = routes;
