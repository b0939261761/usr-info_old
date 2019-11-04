/* eslint-disable no-await-in-loop */

const puppeteer = require('puppeteer');
const { delay } = require('../utils/tools');
const { setCaptchaToken, getCaptchaToken } = require('./captcha');

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

const getTableValues = el => {
  const getCell = row => row.cells[1].innerHTML.replace(/(<br>)|(<hr>)/g, '\n');
  return {
    fullName: getCell(el.rows[0]),
    legalForm: getCell(el.rows[2]),
    name: getCell(el.rows[3]),
    address: getCell(el.rows[6]),
    founders: getCell(el.rows[7]),
    dataAuthorizedCapital: getCell(el.rows[8]),
    activities: getCell(el.rows[9]),
    persons: getCell(el.rows[11]),
    dateAndRecordNumber: getCell(el.rows[12]),
    contacts: getCell(el.rows[31])
  };
};

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
    const reCaptchaResponse = await page.waitForSelector('#g-recaptcha-response');
    const captchaKey = await reCaptcha.evaluate(el => el.dataset.sitekey);
    const captchaToken = await getCaptcha(captchaKey);
    await reCaptchaResponse.evaluate((el, val) => { el.value = val; }, captchaToken);
    await page.click('input[type=submit]');

    // Ответ от сервера
    const elem = await Promise.race([
      page.waitForSelector('form.detailinfo input[type=submit]'),
      page.waitForSelector('div.ui-state-error')
    ]);

    if ((await elem.evaluate(el => el.tagName)) === 'DIV') {
      // Ошибка
      if (await elem.$eval('p', el => el.textContent.includes('знайдено'))) {
        return { code };
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
    || err.message.startsWith('net::ERR_PROXY_CONNECTION_FAILED')
    ) throw new Error('INVALID_PROXY');

    throw new Error(err);
  } finally {
    await browser.close();
  }
};
