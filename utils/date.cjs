const { zeroStart } = require('./tools.cjs');

const getDateTime = (date = new Date()) => (date instanceof Date ? date : new Date(date));

exports.formatDate = (format, datePar) => {
  if (!format) return '';
  const date = getDateTime(datePar);
  let result = format.toString();

  const mask = {
    YYYY: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(2),
    MM: zeroStart(date.getMonth() + 1),
    DD: zeroStart(date.getDate()),
    HH: zeroStart(date.getHours()),
    mm: zeroStart(date.getMinutes()),
    ss: zeroStart(date.getSeconds()),
    SSS: zeroStart(date.getMilliseconds(), 3)
  };

  Object.entries(mask).forEach(({ 0: key, 1: value }) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });

  return result;
};

exports.addDays = (amount = 0, datePar) => {
  const date = getDateTime(datePar);
  date.setDate(date.getDate() + amount);
  return date;
};

exports.subtractDays = (amount = 0, datePar) => {
  const date = getDateTime(datePar);
  date.setDate(date.getDate() - amount);
  return date;
};

exports.addHours = (amount = 0, datePar) => {
  const date = getDateTime(datePar);
  date.setHours(date.getHours() + amount);
  return date;
};

exports.dateToObj = datePar => {
  const date = getDateTime(datePar);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
};

exports.getDateObj = ({ year, month, day }) => {
  const currentDate = new Date();
  return {
    year: year || currentDate.getFullYear(),
    month: month >= 1 && month <= 12 ? +month : currentDate.getMonth() + 1,
    day: +day || currentDate.getDay()
  };
};

exports.monthToStr = month => zeroStart(month);

exports.dayToStr = day => zeroStart(day);
