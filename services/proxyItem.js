const db = require('../db');
const { delay } = require('../utils/tools');

module.exports = class {
  async get() {
    this.id = null;
    const proxy = await db.getProxy();
    if (!proxy) throw new Error('NO_PROXY');
    console.info(proxy);
    const { id, username, password, lastActive } = proxy;
    const timeout = process.env.REPEAT_PROXY_TIMEOUT * 1000 - Date.now() + lastActive;
    if (timeout > 0) await delay(timeout);

    this.id = id;
    const protocol = proxy.protocol ? `${proxy.protocol}://` : ''
    const server = `${protocol}${proxy.server}`;
    const authenticate = username || password ? { username, password } : null;
    return { server, authenticate };
  }

  resetError() { return db.resetErrorProxy(this.id); }

  setError() { return db.setErrorProxy(this.id); }

  setLastActive() {
    if (this.id) return db.setLastActiveProxy(this.id);
    return true;
  }
};
