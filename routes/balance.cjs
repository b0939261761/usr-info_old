const routes = require('express').Router();
const { catchAsyncRoute } = require('../utils/tools.cjs');
const { getCaptchaBalance } = require('../services/captcha.cjs');

routes.get('', catchAsyncRoute(async (req, res) => res.send(await getCaptchaBalance())));

module.exports = routes;
