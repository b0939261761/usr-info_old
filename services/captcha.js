const axios = require('axios');

const http = axios.create({
  baseURL: 'http://rucaptcha.com/',
  params: { key: process.env.RUCAPTCHA_KEY, json: 1 }
});

// --------- checkBalance --------

exports.getCaptchaBalance = async () => {
  const response = await http.get('res.php', { params: { action: 'getbalance' } });
  const { status, request } = response.data;
  if (status) return request;
  throw new Error(`CAPTCHA_${request}`);
};

exports.setCaptchaToken = async key => {
  const response = await http.get('in.php', {
    params: {
      method: 'userrecaptcha',
      googlekey: key,
      pageurl: process.env.SITE_URL
    }
  });
  const { status, request } = response.data;
  if (status) return response.data.request;
  throw new Error(`CAPTCHA_${request}`);
};

exports.getCaptchaToken = async idCaptcha => {
  const response = await http.get('res.php', {
    params: {
      action: 'get',
      id: idCaptcha
    }
  });
  const { status, request } = response.data;
  if (status) return request;
  if (request === 'CAPCHA_NOT_READY') return false;
  throw new Error(`CAPTCHA_${request}`);
};
