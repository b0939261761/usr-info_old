/* eslint-disable no-continue */
const { delay } = require('../utils/tools');
const { nextCode } = require('../utils/code');
const db = require('../db');
const { getCaptchaBalance } = require('./captcha');
const grabber = require('./grabber');
const ProxyItem = require('./proxyItem');
const { sendErrorMail } = require('./mail');
const sendMarketing = require('./sendMarketing');
const AmoCRM = require('./amoCRM');
const checkStatus = require('../organization/checkStatus');
const { formatDate, subtractDays } = require('../utils/date');
// const { exists } = require('../db/db');

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
        && new Date().getHours() < process.env.HOUR_START_GRABBER)
  ) {
    console.info('STOP GRABBER');
    await delay(process.env.STOP_GRABBER_TIMEOUT * 1000);
    return false;
  }

  return true;
};

// ------------------------

(async () => {
  const proxyItem = new ProxyItem();
  let prevCode = '43904649';

  for (let prevError = new Error(''); ;) {
    try {
      const code = nextCode(prevCode);
      console.info(`CODE: ${code}`);
      if (await db.existsOrganization(code)) {
        prevCode = code;
        continue;
      }

      if (code === '43914018') {
        console.info('CANCEL -----------------');
        break;
      }
      const lastOrganization = (await db.getLastOrganization()) || {};
      if (!await checkDateToWork(lastOrganization.dateRegistration)) continue;
      if ((await getCaptchaBalance()) < MIN_BALANCE) throw new Error('CAPTCHA_NO_BALANCE');
      const proxy = await proxyItem.get();
      const organization = await grabber({ proxy, code });
      await proxyItem.resetError();
      const organizationDB = await db.addOrganization(organization);
      prevCode = code;
      await sendMarketing(organizationDB);
      await sendContacts();
    } catch (err) {
      const errMessage = err.message;
      const time = formatDate('YYYY-MM-DD HH:mm:ss');

      if (errMessage.startsWith('INVALID_PROXY')) {
        await proxyItem.setError();
        console.error(time, errMessage);
      } else if (errMessage === 'ERROR_CAPTCHA_UNSOLVABLE') {
        console.error(time, errMessage);
      } else {
        console.error(time, err);
        if (errMessage !== prevError.message) await sendErrorMail(err);
        if (errMessage === 'STRUCTURE_ERROR') return;
        prevError = err;
        await delay(process.env.ERROR_TIMEOUT * 1000);
      }
    } finally {
      await proxyItem.setLastActive();
    }
  }
})();
