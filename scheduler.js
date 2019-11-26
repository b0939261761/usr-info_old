const { job } = require('cron');
const toSendFile = require('./organization/toSendFile');
const { subtractDays, dateToObj } = require('./utils/date');

// ---------------

job('00 01 00 * * *', (async () => {
  try {
    await toSendFile(dateToObj(subtractDays(1)));
  } catch (err) {
    console.error(err);
  }
}), null, true);
