/* eslint-disable no-await-in-loop */
const { delay } = require('../utils/tools');
const { nextCode } = require('../utils/code');
const db = require('./db');
const { getCaptchaBalance } = require('./captcha');
const grabber = require('./grabber');
const Proxy = require('./proxy');
const { sendErrorMail } = require('./mail');

const MIN_BALANCE = 1;

// ------------------------

const setStatusOrganization = org => {
  const status = 'unsuitable';

  if (org.fullName) {
    // status = 'suitable';
  }

  return status;
};

// ------------------------

const sendContacts = async () => {
  const organizations = await db.getOrganizations({ status: 'suitable' });

  // eslint-disable-next-line no-restricted-syntax
  for (const organization of organizations) {
    // await db.setStatusOrganization({ id: organization.id, status: 'send' });
  }
};

// ------------------------

(async () => {
  const proxy = new Proxy();
  for (let prevError = new Error(''); ;) {
    try {
      if ((await getCaptchaBalance()) < MIN_BALANCE) throw new Error('CAPTCHA_NO_BALANCE');
      const server = await proxy.get();
      const code = nextCode((await db.getLastCode()) || '43311880');
      console.log(code);
      const org = await grabber({ server, code });
      await proxy.resetError();
      const status = setStatusOrganization(org);
      await db.addOrganization({ ...org, status });
      await sendContacts();
    } catch (err) {
      const errMessage = err.message;
      if (errMessage === 'INVALID_PROXY') {
        await proxy.setError();
        console.warn(errMessage);
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
