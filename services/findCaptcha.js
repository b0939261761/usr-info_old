// https://rucaptcha.com/api-rucaptcha#callback
// https://gist.github.com/2captcha/2ee70fa1130e756e1693a5d4be4d8c70
module.exports = () => {
  const findCallback = client => {
    for (const [key0, value0] of Object.entries(client)) {
      for (const [key1, value1] of Object.entries(value0)) {
        if (typeof value1 === 'object' && value1.hasOwnProperty('sitekey')) {
          return {
            sitekey: value1.sitekey,
            function: value1.callback,
            callback: `___grecaptcha_cfg.clients[${client.id}].${key0}.${key1}.callback`
          }
        }
      }
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  const cfg = globalThis.___grecaptcha_cfg;
  if (!cfg) return;
  const result = [];

  for (const client of Object.values(cfg.clients)) {
    const clientRes = findCallback(client);
    if (clientRes) result.push(clientRes);
  }
  return result;
};
