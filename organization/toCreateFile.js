const fs = require('fs');
const path = require('path');
const stream = require('stream');
const archiver = require('archiver');
const util = require('util');
const { rowToCsv, header } = require('./toCsv');
const encodeToWin1251 = require('../utils/encodeToWin1251');
const { PATH_TMP } = require('../shared-data');

const pipeline = util.promisify(stream.pipeline);

//-----------------------------

class ToCSV extends stream.Transform {
  index = 0;

  constructor(firstLine, options) {
    super(options);
    this.push(encodeToWin1251(firstLine));
  }

  // eslint-disable-next-line no-underscore-dangle
  _transform(chunk, encoding, done) {
    this.push(encodeToWin1251(rowToCsv({ index: ++this.index, ...chunk.row })));
    done();
  }
}

//-----------------------------

module.exports = async (fileName, streamInput) => {
  const pathOutput = path.join(PATH_TMP, `${fileName}.zip`);
  const output = fs.createWriteStream(pathOutput);
  const archive = archiver('zip', { zlib: { level: 9 } });
  const toCsv = new ToCSV(header, { objectMode: true });

  const inputToCsv = streamInput.pipe(toCsv);
  archive.append(inputToCsv, { name: `${fileName}.csv` }).finalize();

  await pipeline(archive, output);
  return new Promise(resolve => output.on('close', () => resolve(pathOutput)));
};
