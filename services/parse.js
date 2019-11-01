/* eslint-disable no-await-in-loop */

const puppeteer = require('puppeteer');
const { delay } = require('../utils/tools');
const { setCaptchaToken, getCaptchaToken } = require('../services/captcha');

// -----------------------------------

const getCaptcha = async key => {
  const id = 0 || await setCaptchaToken(key);
  const maxTimestamp = Date.now() + process.env.GET_CAPTCHA_TOKEN_MAX_TIMEOUT * 1000;

  if (!id) throw new Error('CAPTCHA_NO_ID');

  await delay(process.env.GET_CAPTCHA_TOKEN_FIRST_TIMEOUT * 1000);
  do {
    const token = await getCaptchaToken(id);
    if (token) return token;
    await delay(process.env.GET_CAPTCHA_TOKEN_NEXT_TIMEOUT * 1000);
  } while (Date.now() < maxTimestamp);

  throw new Error('CAPTCHA_NO_TOKEN');
};

// -----------------------------------

const getTableValues = el => ({
  fullName: el.rows[0].cells[1].textContent,
  fullNameEn: el.rows[1].cells[1].textContent,
  address: el.rows[6].cells[1].textContent,
  phone: el.rows[31].cells[1].textContent
});

// -----------------------------------

module.exports = async ({ proxy, code }) => {
  const browser = await puppeteer.launch({
    args: [`--proxy-server=${proxy.server}`],
    headless: process.env.NODE_ENV === 'production'
  });

  try {
    const { 0: page } = await browser.pages();
    page.setDefaultTimeout(process.env.NAVIGATION_TIMEOUT * 1000);
    await page.setUserAgent(process.env.USER_AGENT);
    await page.goto(process.env.SITE_URL);

    // Выбор кода
    await page.click('#yurcheck');
    await page.$eval('#query', (el, val) => { el.value = val; }, code);
    await page.click('input[type=submit]');

    // Отправка captcha
    const reCaptcha = await page.waitForSelector('.g-recaptcha');
    const captchaKey = await reCaptcha.evaluate(el => el.dataset.sitekey);
    const captchaToken = await getCaptcha(captchaKey);
    await page.$eval('#g-recaptcha-response', (el, val) => { el.value = val; }, captchaToken);
    await page.click('input[type=submit]');

    // Ответ от сервера
    const elem = await Promise.race([
      page.waitForSelector('form.detailinfo input[type=submit]'),
      page.waitForSelector('div.ui-state-error')
    ]);

    if ((await elem.evaluate(el => el.tagName)) === 'DIV') {
      // Ошибка
      if (await elem.$eval('p', el => el.textContent.includes('знайдено'))) {
        return { code, fullName: 'NOT_FOUND' };
      }
      throw new Error('INVALID_PROXY');
    } else {
      // Собираем основные данные
      await elem.click();
      const table = await page.waitForSelector('table#detailtable');
      const tableValues = await table.evaluate(getTableValues);
      return { code, ...tableValues };
    }
  } catch (err) {
    if (
      err instanceof puppeteer.errors.TimeoutError
    || err.message.startsWith('net::ERR_CERT_AUTHORITY_INVALID')
    || err.message.startsWith('net::ERR_TIMED_OUT')
    ) throw new Error('INVALID_PROXY');

    throw new Error(err);
  } finally {
    await browser.close();
  }
};
