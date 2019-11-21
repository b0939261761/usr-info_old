const { job } = require('cron');
const toSendFile = require('./organization/toSendFile');
const { subtractDays, dateToObj } = require('./utils/date');
const cleanFolder = require('./utils/cleanFolder');
const { PATH_TMP } = require('./shared-data');

// ---------------

job('00 01 00 * * *', (async () => {
  try {
    await toSendFile(dateToObj(subtractDays(1)));
  } catch (err) {
    console.error(err);
  }
}), null, true);


job('00 00 01 * * *', (async () => {
  try {
    await cleanFolder(PATH_TMP);
  } catch (err) {
    console.error(err);
  }
}), null, true);
