const stream = require('stream');
const archiver = require('archiver');
const { rowToCsv, header } = require('./toCsv.cjs');
const encodeToWin1251 = require('../utils/encodeToWin1251.cjs');

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

module.exports = (fileName, streamInput) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const toCsv = new ToCSV(header, { objectMode: true });

  const inputToCsv = streamInput.pipe(toCsv);
  archive.append(inputToCsv, { name: `${fileName}.csv` }).finalize();

  return archive;
};
