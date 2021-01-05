const puppeteer = require('puppeteer');
const { delay } = require('../utils/tools.cjs');
const { setCaptchaToken, getCaptchaToken } = require('./captcha.cjs');
const findCaptcha = require('./findCaptcha.cjs');

// -----------------------------------

const netErrors = [
  'net::ERR_CERT_AUTHORITY_INVALID',
  'net::ERR_INVALID_AUTH_CREDENTIALS',
  'net::ERR_TIMED_OUT',
  'net::ERR_PROXY_CONNECTION_FAILED',
  'net::ERR_TUNNEL_CONNECTION_FAILED',
  'net::ERR_EMPTY_RESPONSE',
  'net::ERR_CONNECTION_RESET',
  'net::ERR_SSL_PROTOCOL_ERROR',
  'net::ERR_CERT_COMMON_NAME_INVALID',
  'net::ERR_CONNECTION_CLOSED',
  'net::ERR_SOCKET_NOT_CONNECTED'
];

// -------------------------------------------------

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
  const replaceTo = (char, row) => row.cells[1].textContent
    .replace(/(<br>&nbsp;<br>)|(<br>)|(<hr>)/g, char);
  const replaceToNewLine = replaceTo.bind(null, '\n');
  const replaceToTrim = replaceTo.bind(null, '');
  const rowCount = el.querySelectorAll('tr').length;

  if (rowCount === 29) {
    return {
      fullName: replaceToTrim(el.rows[0]),
      legalForm: replaceToNewLine(el.rows[1]),
      name: replaceToNewLine(el.rows[2]),
      address: replaceToNewLine(el.rows[5]),
      dataAuthorizedCapital: replaceToNewLine(el.rows[6]),
      founders: replaceToNewLine(el.rows[7]),
      activities: replaceToNewLine(el.rows[9]),
      persons: replaceToNewLine(el.rows[11]),
      dateAndRecordNumber: replaceToNewLine(el.rows[13]),
      contacts: replaceToNewLine(el.rows[28])
    };
  } if (rowCount === 17) {
    return {
      fullName: replaceToTrim(el.rows[0]),
      legalForm: replaceToNewLine(el.rows[1]),
      name: replaceToNewLine(el.rows[2]),
      address: replaceToNewLine(el.rows[4]),
      dateAndRecordNumber: replaceToNewLine(el.rows[6]),
      persons: replaceToNewLine(el.rows[9])
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
    if (proxy.authenticate) await page.authenticate(proxy.authenticate);
    await page.goto(process.env.SITE_URL);

    // Выбор кода
    const legalEntity = await page.waitForSelector('app-radio-buttons input[value="2"]');
    await legalEntity.click();
    await page.focus('app-input-field input:enabled');
    await page.keyboard.type(code);
    await page.click('button[type="submit"]');

    // Отправка captcha
    const frame = await page.waitForSelector('re-captcha iframe');
    const recatchaSrc = await frame.evaluate(el => el.src);
    const captchaKey = new URL(recatchaSrc).searchParams.get('k');
    const captchaToken = await getCaptcha(captchaKey);

    await page.evaluate(({ captchaToken, findCaptchaText }) => {
      eval(eval(findCaptchaText)()[0].callback)(captchaToken);
    }, { captchaToken, findCaptchaText: `${findCaptcha}` });

    await page.waitForTimeout(1000);
    await page.click('recaptcha-wrapper button');

    const searchResultTable = await page.waitForSelector('search-result-table');
    const textError = await searchResultTable.$('.text-danger');
    if (textError) {
      if (await textError.evaluate(el => el.textContent.includes('знайдено'))) {
        return { code };
      }
      throw new Error('INVALID_PROXY_TRY_LATER');
    }

    const tableRow = await page.waitForSelector('.table-wrapper tr');
    const stayInformation = await tableRow.evaluate(el => el.cells[3].textContent);
    await page.click('.table-wrapper button');
    await page.waitForSelector('app-table .table-wrapper tr:nth-child(2)');
    const tableValues = await page.$eval('.table-wrapper table', getTableValues);
    return { code, stayInformation, ...tableValues };
  } catch (err) {
    if (err instanceof puppeteer.errors.TimeoutError) throw new Error('INVALID_PROXY_TIMEOUT');

    const netError = netErrors.find(el => err.message.startsWith(el));
    if (netError) throw new Error(`INVALID_PROXY_${netError}`);

    throw err;
  } finally {
    await browser.close();
  }
};
