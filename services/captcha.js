const axios = require('axios');

const http = axios.create({
  baseURL: 'http://rucaptcha.com/',
  params: { key: process.env.RUCAPTCHA_KEY, json: 1 }
});


// const URL_GET_TOKEN = `https://rucaptcha.com/in.php?key=${key}&method=userrecaptcha&googlekey=6Le-wvkSVVABCPBMRTvw0Q4Muexq1bi0DJwx_mJ-&pageurl=http://mysite.com/page/with/recaptcha

// https:// rucaptcha.com/in.php?key=1abc234de56fab7c89012d34e56fa7b8&method=userrecaptcha&googlekey=6Le-wvkSVVABCPBMRTvw0Q4Muexq1bi0DJwx_mJ-&pageurl=http://mysite.com/page/with/recaptcha


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
      pageurl: 'https://usrinfo.minjust.gov.ua/edr.html'
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
