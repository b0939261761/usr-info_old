/* eslint-disable no-continue */
const { delay } = require('../utils/tools');
const { nextCode } = require('../utils/code');
const db = require('../db');
const { getCaptchaBalance } = require('./captcha');
const grabber = require('./grabber');
const Proxy = require('./proxy');
const { sendErrorMail } = require('./mail');
const AmoCRM = require('./amoCRM');
const checkStatus = require('../organization/checkStatus');
const { formatDate, subtractDays } = require('../utils/date');

const MIN_BALANCE = 1;

const amoCRM = new AmoCRM();

// ------------------------

const sendContacts = async () => {
  const organizations = await db.getOrganizations({ status: 'none' });

  for (const organization of organizations) {
    const status = checkStatus(organization) ? 'send' : 'unsuitable';
    if (status === 'send') await amoCRM.send(organization);
    await db.setStatusOrganization({ id: organization.id, status });
  }
};

const checkDateToWork = async dateRegistration => {
  const currentDate = formatDate('YYYY-MM-DD');
  const prevDate = formatDate('YYYY-MM-DD', subtractDays(1));
  // Выходной день или дата регистрации = текущий день
  // или (дата регистрации предыдущий день или предыдущий день выходной,
  //      но час текущего дня меньше заданного
  if (await db.existsHoliday(currentDate)
    || dateRegistration >= currentDate
    || ((dateRegistration === prevDate || await db.existsHoliday(prevDate))
        && new Date().getHours() <= process.env.HOUR_START_GRABBER)
  ) {
    console.info('STOP GRABBER');
    await delay(process.env.STOP_GRABBER_TIMEOUT * 1000);
    return false;
  }

  return true;
};

// ------------------------

(async () => {
  const proxy = new Proxy();

  for (let prevError = new Error(''); ;) {
    try {
      const lastOrganization = (await db.getLastOrganization()) || {};
      if (!await checkDateToWork(lastOrganization.dateRegistration)) continue;
      if ((await getCaptchaBalance()) < MIN_BALANCE) throw new Error('CAPTCHA_NO_BALANCE');
      const server = await proxy.get();
      const code = nextCode(lastOrganization.code || '43311880');
      console.info(`Code: ${code}`);
      const organization = await grabber({ server, code });
      await proxy.resetError();
      await db.addOrganization(organization);
      await sendContacts();
    } catch (err) {
      const errMessage = err.message;
      if (errMessage === 'INVALID_PROXY') {
        await proxy.setError();
        console.error(errMessage);
      } else if (errMessage === 'ERROR_CAPTCHA_UNSOLVABLE') {
        console.error(err.message);
      } else {
        console.error(err);
        if (errMessage !== prevError.message) await sendErrorMail(err);
        if (errMessage === 'STRUCTURE_ERROR') return;
        prevError = err;
        await delay(process.env.ERROR_TIMEOUT * 1000);
      }
    } finally {
      await proxy.setLastActive();
    }
  }
})();
