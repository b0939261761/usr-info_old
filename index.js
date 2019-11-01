/* eslint-disable no-await-in-loop */

const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

const { delay } = require('./utils/tools');
const { nextCode } = require('./utils/code');
const db = require('./services/db');
const { getCaptchaBalance } = require('./services/captcha');
const parse = require('./services/parse');

// -----------------------------

const getProxy = async () => {
  const proxy = await db.getProxy();
  if (!proxy) throw new Error('NO_PROXY');

  const timeout = process.env.REPEAT_PROXY_TIMEOUT * 1000 - Date.now() + proxy.lastActive;
  if (timeout > 0) await delay(timeout);

  return proxy;
};

// ------------------------

(async () => {
  for (;;) {
    try {
      const proxy = await getProxy();
      if ((await getCaptchaBalance()) < 1) throw new Error('CAPTCHA_NO_BALANCE');
      const code = nextCode((await db.getLastCode()) || '40200240');

      console.log(proxy);
      const org = await parse({ proxy, code });
      await db.addOrganization(org);
      await db.setLastActiveProxy(proxy.id);
    } catch (err) {
      console.error(err);
      if (err.message === 'INVALID_PROXY') await db.setDisableProxy(proxy.id);
      else await delay(process.env.ERROR_TIMEOUT * 1000);
    }
  }
})();
