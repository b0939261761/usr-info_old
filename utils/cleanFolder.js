/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

const { promises: fs } = require('fs');
const path = require('path');

const cleanFolder = async folder => {
  const files = await fs.readdir(folder, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(folder, file.name);
    if (file.isDirectory()) {
      await cleanFolder(filePath);
      fs.rmdir(filePath);
    } else {
      await fs.unlink(filePath);
    }
  }
};


module.exports = cleanFolder;
