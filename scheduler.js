const { job } = require('cron');
const db = require('./db/db');
// const organizationToCsv = require('../organization/organizationToCsv');
const { sendReportMail } = require('./services/mail');
const { subtractDays, formatDate } = require('./utils/date');
const cleanFolder = require('./utils/cleanFolder');

// ---------------

job('00 01 00 * * *', (async () => {
  try {
    const date = subtractDays(1);
    // const organizations = await db.getOrganizations({ date: formatDate('YYYY-MM-DD', date) });
    // const content = organizationToCsv(organizations);
    // await sendReportMail({ date, content });
  } catch (err) {
    console.error(err);
  }
}), null, true);


job('00 21 00 * * *', (async () => {
  try {
    await cleanFolder();
  } catch (err) {
    console.error(err);
  }
}), null, true);
