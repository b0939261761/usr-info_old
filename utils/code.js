const generateCode = code => {
  let sum = code < 3_000_000 || code > 6_000_000
    ? code[0] * 1 + code[1] * 2 + code[2] * 3
      + code[3] * 4 + code[4] * 5 + code[5] * 6 + code[6] * 7
    : code[0] * 7 + code[1] * 1 + code[2] * 2
      + code[3] * 3 + code[4] * 4 + code[5] * 5 + code[6] * 6;

  if (sum / 11 > 10) {
    sum = code < 3_000_000 || code > 6_000_000
      ? code[0] * 3 + code[1] * 4 + code[2] * 5
        + code[3] * 6 + code[4] * 7 + code[5] * 8 + code[6] * 9
      : code[0] * 9 + code[1] * 3 + code[2] * 4
        + code[3] * 5 + code[4] * 6 + code[5] * 7 + code[6] * 8;
  }

  const mod = sum % 11;

  return code + (mod === 10 ? 0 : mod);
};

// ----------------------------------------

exports.nextCode = code => generateCode((+code.slice(0, -1) + 1).toString().padStart(7, '0'));
