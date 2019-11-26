const routes = require('express').Router();
const Busboy = require('busboy');
const readline = require('readline');
const { catchAsyncRoute } = require('../utils/tools');
const { formatDate } = require('../utils/date');
const { getHolidays, addHolidays } = require('../db');

routes.get('', catchAsyncRoute(async (req, res) => res.json(
  await getHolidays(req.query.date || formatDate('YYYY-MM-DD'))
)));

routes.post('', catchAsyncRoute(async (req, res, next) => {
  const patternDate = new RegExp(
    '(((0[1-9]|[12]\\d|3[01])\\.(0[13578]|1[02])\\.((19|[2-9]\\d)\\d{2}))'
    + '|((0[1-9]|[12]\\d|30)\\.(0[13456789]|1[012])\\.((19|[2-9]\\d)\\d{2}))'
    + '|((0[1-9]|1\\d|2[0-8])\\.02\\.((19|[2-9]\\d)\\d{2}))'
    + '|(29\\.02\\.((1[6-9]|[2-9]\\d)'
    + '(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))',
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
        const dates = line.match(patternDate);
        if (dates) {
          dates.forEach(
            el => buffer.push([el.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')])
          );
        }

        if (buffer.length === 500) {
          await addHolidays(buffer);
          buffer.length = 0;
        }
      }

      if (buffer.length) await addHolidays(buffer);
    } catch (err) {
      errors.push(err);
    }

    fieldNames.splice(fieldNames.indexOf(fieldName), 1);
    if (!fieldNames.length) {
      if (errors.length) return next(errors.length === 1 ? errors[0] : errors);
      return res.redirect('holidays');
    }

    return null;
  };

  const busboy = new Busboy({ headers: req.headers });
  busboy.on('file', busboyOnFile);
  busboy.on('finish', () => !fieldNames.length && next(new Error('NO_FILES')));
  return req.pipe(busboy);
}));

module.exports = routes;
