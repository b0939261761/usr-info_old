/* eslint-disable no-await-in-loop */

const puppeteer = require('puppeteer');
const { delay } = require('../utils/tools');
const { setCaptchaToken, getCaptchaToken } = require('../services/captcha');

const GET_CAPTCHA_TOKEN_MAX_TIMEOUT = 120_000;
const GET_CAPTCHA_TOKEN_FIRST_TIMEOUT = 5_000;
const GET_CAPTCHA_TOKEN_NEXT_TIMEOUT = 5_000;

// -----------------------------------

const goToPage = async browser => {
  const { 0: page } = await browser.pages();
  await page.setUserAgent(process.env.USER_AGENT);

  try {
    await page.goto(process.env.SITE_URL, { timeout: process.env.NAVIGATION_TIMEOUT });
    return page;
  } catch (err) {
    if (
      err instanceof puppeteer.errors.TimeoutError
    || err.message.startsWith('net::ERR_CERT_AUTHORITY_INVALID')
    ) {
      await browser.close();
      throw new Error('INVALID_PROXY');
    }

    throw new Error(err);
  }
};

// -----------------------------------

const getCaptcha = async key => {
  const id = await setCaptchaToken(key);
  const timestamp = Date.now();
  let token;

  await delay(GET_CAPTCHA_TOKEN_FIRST_TIMEOUT);
  while (GET_CAPTCHA_TOKEN_MAX_TIMEOUT - new Date() + timestamp > 0) {
    token = await getCaptchaToken(id);
    console.log('getToken');
    if (token) break;
    await delay(GET_CAPTCHA_TOKEN_NEXT_TIMEOUT);
  }
  return { id, token };
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
    // args: [`--proxy-server=${proxy.server}`],
    headless: process.env.NODE_ENV === 'production'
  });

  const page = await goToPage(browser);

  await page.click('#yurcheck');
  await page.$eval('#query', (el, val) => { el.value = val; }, code);

  await page.click('input[type=submit]');

  const captchaKey = await page.$eval('.g-recaptcha', el => el.dataset.sitekey);
  console.log('captchaKey', captchaKey);

  const { id: captchaId, token: captchaToken } = await getCaptcha(captchaKey);
  console.log('captchaToken', captchaToken);
  console.log('captchaId', captchaId);

  await page.$eval('#g-recaptcha-response', (el, val) => { el.value = val; }, captchaToken);

  await page.click('input[type=submit]');

  await page.click('form.detailinfo input[type=submit]');

  const tableValues = await page.$eval('table#detailtable', getTableValues);

  // await browser.close();

  return { code, captchaId, ...tableValues };
};
