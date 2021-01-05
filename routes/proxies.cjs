const routes = require('express').Router();
const Busboy = require('busboy');
const readline = require('readline');
const { catchAsyncRoute } = require('../utils/tools.cjs');
const { getProxies, addProxies, removeProxies, getAmountProxy, resetErrorProxies } = require('../db/index.cjs');

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getProxies())));

routes.post('', catchAsyncRoute(async (req, res, next) => {
  const patternServer = new RegExp(
    '(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}'
    + '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))'
    + ':([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}'
    + '|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])'
  );

  const fieldNames = [];
  const errors = [];

  const busboyOnFile = async (fieldName, file) => {
    fieldNames.push(fieldName);
    try {
      const buffer = [];
      const rl = readline.createInterface({ input: file, crlfDelay: Infinity });

      for await (const line of rl) {
        const values = line.split(';');

        const server = values[0] || '';
        const protocol = values[1] || '';
        const username = values[2] || '';
        const password = values[3] || '';

        if (patternServer.test(server)) buffer.push({ server, protocol, username, password });
        if (buffer.length === 500) {
          await addProxies(buffer);
          buffer.length = 0;
        }
      }

      if (buffer.length) await addProxies(buffer);
    } catch (err) {
      errors.push(err);
    }

    fieldNames.splice(fieldNames.indexOf(fieldName), 1);
    if (!fieldNames.length) {
      if (errors.length) return next(errors.length === 1 ? errors[0] : errors);
      return res.redirect('proxies/amount');
    }

    return null;
  };

  const busboy = new Busboy({ headers: req.headers });
  busboy.on('file', busboyOnFile);
  busboy.on('finish', () => !fieldNames.length && next(new Error('NO_FILES')));
  return req.pipe(busboy);
}));

routes.get('/remove', catchAsyncRoute(async (req, res) => {
  await removeProxies();
  res.json(await getProxies());
}));

routes.get('/amount', catchAsyncRoute(async (req, res) => res.json(await getAmountProxy())));

routes.get('/reset-error', catchAsyncRoute(async (req, res) => {
  await resetErrorProxies();
  res.json(await getProxies());
}));

module.exports = routes;
