const { promises: fs } = require('fs');
const path = require('path');

var removeDir = async (dirPath) {
  if (fs.existsSync(dirPath)) {
    return;
  }




  const list = fs.readdirSync(dirPath);
  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dirPath, list[i]);
    const stat = fs.statSync(filename);

    if (filename == '.' || filename == '..') {
      // do nothing for current and parent dir
    } else if (stat.isDirectory()) {
      removeDir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }

  fs.rmdirSync(dirPath);
};
