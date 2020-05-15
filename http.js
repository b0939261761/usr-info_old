const http = require('http');
const https = require('https');
const url = require('url');
require('dotenv').config();


const parseContentType = value => {
  const [type, charsetStr] = (value && value.split(';')) || [];
  const charset = (charsetStr && charsetStr.match(/charset=(.+)/)) || 'utf-8';
  return { type, charset };
};

const parseData = (buffer, mimeType) => {
  const data = Buffer.concat(buffer).toString();
  return mimeType === 'application/json' ? JSON.parse(data) : data;
};

const myHttp = config => new Promise((resolve, reject) => {
  const response = { config };
  const { data } = config;
  const { headers } = config;

  const urlRequest = new URL(config.url, config.baseUrl);


  // opts.port = remote.port || (remote.protocol == 'https:' ? 443 : 80);
  // opts.path = proxy ? uri : remote.pathname + (remote.search || '');

  const options = {
    protocol: urlRequest.protocol,
    host: urlRequest.hostname,
    port: urlRequest.port,
    path: urlRequest.pathname,
    method: config.method,
    headers: config.headers,
    timeout: config.timeout
  };

  const protocol = urlRequest.protocol === 'https:' ? https : http;


  const requestCallback = res => {
    const dataBuffer = [];
    console.log(res.headers);
    const mime = parseContentType(res.headers['content-type']);

    res.on('data', chunk => {
      dataBuffer.push(chunk);
    });

    res.on('end', () => {
      response.data = parseData(dataBuffer, mime.type);
      resolve(response);
    });
  };

  const request = protocol.request(options, requestCallback);
  request.on('error', error => !request.aborted && reject(error));
  request.on('timeout', () => request.abort());
  request.end();
});


const config = {
  baseUrl: 'http://rucaptcha.com/',
  url: 'res',
  path: `?action=getbalance&key=${process.env.RUCAPTCHA_KEY}`,
  method: 'GET',
  timeout: 1000
};

(async () => {
  try {
    const res = await myHttp(config);
    console.log(res.data, typeof res.data);
  } catch (err) {
    console.log(err);
  }
})();
