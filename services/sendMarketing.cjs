const sendMail = require('./sendMail.cjs');
const sendSMS = require('./sendSMS.cjs');

const { checkingForDuplicateEmail, checkingForDuplicatePhone } = require('../db/index.cjs');

const checkPhoneOperator = phone => ['67', '68', '96', '97', '98', '50', '66', '95',
  '99', '63', '73', '93', '91', '92', '94'].includes(phone.slice(4, 6));

module.exports = async ({ phone1, email1, email2, name: company, manager }) => {
  if (checkPhoneOperator(phone1) && await checkingForDuplicatePhone(phone1)) await sendSMS(phone1);

  if (await checkingForDuplicateEmail(email1)) await sendMail({ email: email1, manager, company });
  if (await checkingForDuplicateEmail(email2)) await sendMail({ email: email2, manager, company });
};
