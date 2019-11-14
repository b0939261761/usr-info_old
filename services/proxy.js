// const axios = require('axios');
const db = require('./db');
const { delay } = require('../utils/tools');

module.exports = class {
  id = null;

  async get() {
    this.id = null;
    const proxy = await db.getProxy();
    if (!proxy) throw new Error('NO_PROXY');
    console.log(proxy);

    const { id, server, lastActive } = proxy;
    const timeout = process.env.REPEAT_PROXY_TIMEOUT * 1000 - Date.now() + lastActive;
    if (timeout > 0) await delay(timeout);

    this.id = id;
    // await this.constructor.check(server);
    return server;
  }

  // static async check(server) {
  //   server = '182.53.206.138:8080';
  //   const { 1: host, 2: port } = server.match(/(^.+)(?::)(.+)/);

  //   try {
  //     await axios({
  //       // url: `${process.env.SITE_URL}/favicon.ico`,
  //       url: 'https://api.ipify.org/',
  //       proxy: { host: '182.53.206.138', port: '8080' },
  //       timeout: process.env.PROXY_CHECK_TIMEOUT * 1000
  //     });
  //   } catch (err) {
  //     console.log(`${err.code} | ${err.message}`);
  //     console.log(err);
  //     throw new Error('INVALID_PROXY');
  //   }
  // }

  resetError() { return db.resetErrorProxy(this.id); }

  setError() { return db.setErrorProxy(this.id); }

  setLastActive() {
    if (this.id) return db.setLastActiveProxy(this.id);
    return true;
  }
};
