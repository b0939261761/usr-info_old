/* eslint-disable no-await-in-loop */

const dotenv = require('dotenv');
const { delay } = require('./utils/tools');

if (process.env.NODE_ENV !== 'production') dotenv.config();

const { nextCode } = require('./utils/code');


const db = require('./services/db');

const { getCaptchaBalance } = require('./services/captcha');

const parse = require('./services/parse');


// -----------------------------
// Между использованием proxy делаем таймаут

const loopProxyDelay = async lastActive => {
  const loopProxyTimeout = process.env.LOOP_PROXY_TIMEOUT - Date.now() + lastActive;

  if (loopProxyTimeout > 0) {
    await delay(loopProxyTimeout);
  }
};

// -----------------------------

const getProxy = async ({ proxies, currentProxyIndex }) => {
  let list = proxies;
  let currentIndex = currentProxyIndex;

  if (currentIndex >= list.length) {
    list = await db.getProxies();
    currentIndex = 0;

    if (!list.length) {
      console.error('NO_PROXY');
    }
  }

  const proxy = list[currentIndex];
  if (proxy) await loopProxyDelay(proxy.lastActive);

  return {
    proxies: list, currentProxyIndex: currentIndex, proxy
  };
};

// ------------------------

const checkBalance = async () => {
  const hasBalance = (await getCaptchaBalance()) > 100;
  if (hasBalance) return true;
  throw new Error('CAPTCHA_NO_BALANCE');
};

// ------------------------

(async () => {
  let proxies = [];

  for (let currentProxyIndex = 0; ;++currentProxyIndex) {
    try {
      await checkBalance();
      let proxy;
      ({ proxies, currentProxyIndex, proxy } = await getProxy({ proxies, currentProxyIndex }));

      const code = nextCode((await db.getLastCode()) || '40200214');


      //       await parse({ proxy, code });
      //       await db.setLastActiveProxy(proxy.id);
      const org = await parse({ code: '40200214' });
      await db.addOrganization(org);
    } catch (err) {
      // if (err.message === 'INVALID_PROXY') await db.setDisableProxy(proxy.id);
      // else throw new Error(err);
      await delay(process.env.ERROR_TIMEOUT);
      console.error(err);
    }
    // } else {
    //   await delay(process.env.ERROR_TIMEOUT);
    // }
  }
})();
