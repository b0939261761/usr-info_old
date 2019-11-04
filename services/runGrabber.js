/* eslint-disable no-await-in-loop */

const { delay } = require('../utils/tools');
const { nextCode } = require('../utils/code');
const db = require('./db');
const { getCaptchaBalance } = require('./captcha');
const grabber = require('./grabber');
const { sendErrorMail } = require('./mail');


// -----------------------------

const getProxy = async () => {
  const proxy = await db.getProxy();
  if (!proxy) throw new Error('NO_PROXY');

  const timeout = process.env.REPEAT_PROXY_TIMEOUT * 1000 - Date.now() + proxy.lastActive;
  if (timeout > 0) await delay(timeout);

  return proxy;
};

// ------------------------

const setStatusOrganization = org => {
  let status = 'unsuitable';

  if (org.fullName === '') {
    status = 'invalid';
    // Прикрутить фильтрацию
  } else if (org.fullName !== '') {
    status = 'suitable';
  }

  return status;
};

// ------------------------

const sendContacts = async () => {
  const organizations = await db.getOrganizations({ status: 'suitable' });
  if (!organizations.length) return;
  const ids = organizations.map(el => el.id);
  await db.setStatusOrganizations({ ids, status: 'send' });
};

// ------------------------

module.exports = async () => {
  let prevError = new Error('');

  for (let proxy; ;) {
    try {
      proxy = await getProxy();
      if ((await getCaptchaBalance()) < 1) throw new Error('CAPTCHA_NO_BALANCE');
      const code = nextCode((await db.getLastCode()) || '40200240');
      const org = await grabber({ proxy, code });
      const status = setStatusOrganization(org);
      await db.addOrganization({ ...org, status });
      await db.setLastActiveProxy(proxy.id);

      await sendContacts();
    } catch (err) {
      const errMessage = err.message;
      console.error(err);
      if (errMessage === 'INVALID_PROXY') {
        await db.setDisableProxy(proxy.id);
      } else {
        if (errMessage !== prevError.message) await sendErrorMail(err);
        prevError = err;
        await delay(process.env.ERROR_TIMEOUT * 1000);
      }
    }
  }
};
