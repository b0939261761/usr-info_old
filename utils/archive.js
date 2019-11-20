const zlib = require('zlib');
const fs = require('fs');
const util = require('util');
const stream = require('stream');

// const pipeline = util.promisify(stream.pipeline);
const { pipeline } = stream;

const { Readable } = require('stream');

class Counter extends Readable {
  constructor(opt) {
    super(opt);
    this._index = 0;
    this._max = 200;
  }

  _read() {
    const i = this._index++;
    if (i > this._max) { this.push(null); } else {
      const str = String(i);
      const buf = Buffer.from(str, 'ascii');
      this.push(buf);
    }
  }
}


const archiver = require('archiver');

// create a file to stream archive data to.
const output = fs.createWriteStream('1.zip');


output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`);
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('warning', err => {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', err => {
  throw err;
});

// archive.append(new Counter(), { name: '1.txt' }).finalize();

// pipe archive data to the file
// archive.pipe(output);
// archive.finalize();


async function run() {
  pipeline(
    new Counter(),
    fs.createWriteStream('1.zip'),
    err => {
      if (err) {
        console.error('Pipeline failed.', err);
      } else {
        console.log('Pipeline succeeded.');
      }
    }
  );
  console.log('Pipeline succeeded.');
}

run().catch(console.error);
archive.append(new Counter(), { name: '1.txt' }).finalize();
