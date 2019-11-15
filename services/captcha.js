const axios = require('axios');

const http = axios.create({
  baseURL: 'http://rucaptcha.com/',
  params: { key: process.env.RUCAPTCHA_KEY, json: 1 }
});

const getRequest = ({ data }) => {
  const { status, request } = data;
  if (status) return request;
  const messageError = request.includes('CAPTCHA') ? request : `CAPTCHA: ${request}`;
  throw new Error(messageError);
};

// --------- checkBalance --------

exports.getCaptchaBalance = async () => getRequest(
  await http.get('res.php', { params: { action: 'getbalance' } })
);


exports.setCaptchaToken = async key => getRequest(
  await http.get('in.php', {
    params: {
      method: 'userrecaptcha',
      googlekey: key,
      pageurl: process.env.SITE_URL
    }
  })
);

exports.getCaptchaToken = async idCaptcha => getRequest(
  await http.get('res.php', {
    params: {
      action: 'get',
      id: idCaptcha
    }
  })
);
