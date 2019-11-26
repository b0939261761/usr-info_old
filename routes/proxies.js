const routes = require('express').Router();
const Busboy = require('busboy');
const readline = require('readline');
const { catchAsyncRoute } = require('../utils/tools');
const { getProxies, addProxies, getAmountProxy } = require('../db');


routes.get('', catchAsyncRoute(async (req, res) => res.json(await getProxies())));

routes.post('', catchAsyncRoute(async (req, res, next) => {
  const patternServer = new RegExp(
    '(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}'
  + '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))'
  + ':([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}'
  + '|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])',
    'g'
  );

  const fieldNames = [];
  const errors = [];

  const busboyOnFile = async (fieldName, file, fileName, encoding, mimeType) => {
    if (mimeType !== 'text/plain') {
      const error = new Error('INVALID_TYPE_FILE');
      error.fieldName = fieldName;
      error.fileName = fileName;
      return next(error);
    }

    fieldNames.push(fieldName);
    try {
      const buffer = [];
      const rl = readline.createInterface({ input: file, crlfDelay: Infinity });

      for await (const line of rl) {
        const servers = line.match(patternServer);
        if (servers) servers.forEach(el => { buffer.push([el]); });
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


routes.get('/amount', catchAsyncRoute(async (req, res) => res.json(await getAmountProxy())));

module.exports = routes;
