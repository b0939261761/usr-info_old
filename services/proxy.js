const db = require('../db');
const { delay } = require('../utils/tools');

module.exports = class {
  async get() {
    this.id = null;
    const proxy = await db.getProxy();
    if (!proxy) throw new Error('NO_PROXY');
    console.info(proxy);
    const { id, server, lastActive } = proxy;
    const timeout = process.env.REPEAT_PROXY_TIMEOUT * 1000 - Date.now() + lastActive;
    if (timeout > 0) await delay(timeout);

    this.id = id;
    return server;
  }

  resetError() { return db.resetErrorProxy(this.id); }

  setError() { return db.setErrorProxy(this.id); }

  setLastActive() {
    if (this.id) return db.setLastActiveProxy(this.id);
    return true;
  }
};
