const { zeroStart } = require('../utils/tools');

const calcCode = (code, multiplier) => code
  .split('').reduce((acc, cur, index) => acc + cur * multiplier[index], 0);

const calcSum = (code, multiplier1, multiplier2) => (
  code < 3000000 || code > 6000000 ? calcCode(code, multiplier1) : calcCode(code, multiplier2)
);

const generateCode = (codePar = '') => {
  const code = zeroStart(codePar, 7).slice(0, 7);
  const calcSumWithCode = calcSum.bind(null, code);

  let sum = calcSumWithCode('1234567', '7123456');

  if (sum % 11 > 10) sum = calcSumWithCode('3456789', '9345678');

  return code + (sum % 11 % 10);
};

exports.generateCode = generateCode;

exports.nextCode = code => generateCode(+code + 10);
