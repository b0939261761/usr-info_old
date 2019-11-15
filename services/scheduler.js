const { job } = require('cron');
const db = require('../services/db');
const organizationToCsv = require('../services/organizationToCsv');
const { sendReportMail } = require('../services/mail');
const { subtractDays, formatDate } = require('../utils/date');

// ---------------

job('00 15 00 * * *', (async () => {
  try {
    const date = subtractDays(1);
    const organizations = await db.getOrganizations({ date: formatDate('YYYY-MM-DD', date) });
    const content = organizationToCsv(organizations);
    await sendReportMail({ date, content });
  } catch (err) {
    console.error(err);
  }
}), null, true);
