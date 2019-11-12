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

  throw new Error(`CAPTCHA_NO_TOKEN - ${id}`);
};

// -----------------------------------

const getTableValues = el => {
  const getCell = row => row.cells[1].innerHTML.replace(/(<br>)|(<hr>)/g, '\n');
  const rowCount = el.querySelectorAll('tr').length;

  if (rowCount === 32) {
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
      activity: getCell(el.rows[27]),
      contacts: getCell(el.rows[31])
    };
  } if (rowCount === 18) {
    return {
      fullName: getCell(el.rows[0]),
      legalForm: getCell(el.rows[1]),
      name: getCell(el.rows[2]),
      address: getCell(el.rows[4]),
      persons: getCell(el.rows[6]),
      dateAndRecordNumber: getCell(el.rows[7]),
      activity: getCell(el.rows[14])
    };
  }

  throw new Error('STRUCTURE_ERROR');
};

// -----------------------------------

module.exports = async ({ proxy, code }) => {
  const browser = await puppeteer.launch({
    args: [
      `--proxy-server=${proxy.server}`,
      '--no-sandbox'
    ],
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
    const reCaptchaResponse = await page.waitForSelector('#g-recaptcha-response');
    const captchaKey = await page.$eval('.g-recaptcha', el => el.dataset.sitekey);
    const captchaToken = await getCaptcha(captchaKey);
    await reCaptchaResponse.evaluate((el, val) => { el.value = val; }, captchaToken);
    await page.click('input[type=submit]');

    // Ответ от сервера
    const elem = await Promise.race([
      page.waitForSelector('#restable'),
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
      const stayInformation = await elem.evaluate(el => el.rows[1].cells[3].textContent);
      await page.click('form.detailinfo input[type=submit]');
      const table = await page.waitForSelector('table#detailtable');
      const tableValues = await table.evaluate(getTableValues);
      return { code, stayInformation, ...tableValues };
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
