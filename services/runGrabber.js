/* eslint-disable no-continue */
import { delay } from '../utils/tools.cjs';
import db from '../db/index.cjs';
import { getCaptchaBalance } from './captcha.cjs';
import grabber from './grabber.cjs';
import ProxyItem from './proxyItem.cjs';
import { sendErrorMail } from './mail.cjs';
import sendMarketing from './sendMarketing.cjs';
import AmoCRM from './amoCRM.cjs';
import { formatDate } from '../utils/date.cjs';
import { validationUfop, validationParse } from '../organization/validation.js';
import { lastOrganization, isNewUsrInfo } from './ufop.js';

const MIN_BALANCE = 1;
const amoCRM = new AmoCRM();

// ------------------------

const sendContacts = async () => {
  const organizations = await db.getOrganizations({ status: 'none' });

  for (const organization of organizations) {
    const status = validationParse(organization) ? 'send' : 'unsuitable';
    if (status === 'send') await amoCRM.send(organization);
    await db.setStatusOrganization({ id: organization.id, status });
  }
};

// ------------------------

(async () => {
  const proxyItem = new ProxyItem();

  for (let prevError = new Error(''); ;) {
    try {
      const organizationUfop = await lastOrganization();

      if (!organizationUfop) {
        console.info('NO CODE');
        await delay(process.env.STOP_GRABBER_TIMEOUT * 1000);
        continue;
      }

      const { code } = organizationUfop;
      console.info(`CODE: ${code}`);

      if (!validationUfop(organizationUfop) || await db.existsOrganization(code)) {
        await isNewUsrInfo(organizationUfop.code);
        continue;
      }

      if ((await getCaptchaBalance()) < MIN_BALANCE) throw new Error('CAPTCHA_NO_BALANCE');
      const proxy = await proxyItem.get();
      const organization = await grabber({ proxy, code });
      await proxyItem.resetError();
      const organizationDB = await db.addOrganization(organization);
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
