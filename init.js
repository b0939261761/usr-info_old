const { promises: fs } = require('fs');
const { PATH_TMP } = require('./shared-data');

(async () => {
  await fs.mkdir(PATH_TMP, { recursive: true });
})();
