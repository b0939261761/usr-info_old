import http from 'http';
import https from 'https';

export default async (url, options = {}) => {
  let resolve;
  let reject;

  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  const lib = isHttps ? https : http;

  const params = {
    method: options.method || 'GET',
    protocol: urlObj.protocol,
    host: urlObj.host,
    port: urlObj.port,
    path: urlObj.pathname,
    timeout: options.timeout ?? 0
  };

  const onRequest = async res => {
    const { statusCode } = res;
    if (statusCode < 200 || statusCode >= 300) return reject(new Error(`HTTP: ${statusCode}`));

    if (options.responseType === 'stream') return resolve(res);

    const data = [];
    try {
      for await (const chunk of res) data.push(chunk);
    } catch (err) {
      return reject(err);
    }

    return resolve(Buffer.concat(data).toString());
  };

  const request = (res, rej) => {
    ([resolve, reject] = [res, rej]);
    const req = lib.request(params, onRequest);

    // if (postData) req.write(postData);
    req
      .on('error', error => !req.aborted && reject(error))
      .on('timeout', () => req.abort())
      .end();
  };

  return new Promise(request);
};
