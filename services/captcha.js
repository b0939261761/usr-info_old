const axios = require('axios');

const http = axios.create({
  baseURL: 'http://rucaptcha.com/',
  params: { key: process.env.RUCAPTCHA_KEY, json: 1 }
});

const catchAsyncResponse = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    const error = new Error(`CAPTCHA_HTTP_${err.code}`);
    error.config = err.config;
    error.response = err.response;
    throw error;
  }
};

const getRequest = ({ data }) => {
  const { status, request } = data;
  if (status) return request;
  if (request === 'CAPCHA_NOT_READY') return false;
  const messageError = request.includes('CAPTCHA') ? request : `CAPTCHA: ${request}`;
  throw new Error(messageError);
};


// --------- checkBalance --------

exports.getCaptchaBalance = catchAsyncResponse(async () => getRequest(
  await http.get('res.php', { params: { action: 'getbalance' } })
));

exports.setCaptchaToken = catchAsyncResponse(async key => getRequest(
  await http.get('in.php', {
    params: {
      method: 'userrecaptcha',
      googlekey: key,
      pageurl: process.env.SITE_URL
    }
  })
));

exports.getCaptchaToken = catchAsyncResponse(async idCaptcha => getRequest(
  await http.get('res.php', {
    params: {
      action: 'get',
      id: idCaptcha
    }
  })
));
