const getPhone = value => {
  const phone = ((value && value[1]) || '').replace(/ /g, '');
  if (/\+(?!0|38|30|80)/.test(phone)) return '';

  const phoneSimple = phone.replace(/(\+80)|(\+380)|\D/g, '').slice(-9);
  if (phoneSimple.length < 9 || phoneSimple[0] === '0') return '';
  return `+380${phoneSimple}`;
};

const getPhones = value => {
  const phones = [...value.matchAll(/(?:Телефон .: )(.+)/gm)];

  let phone1 = getPhone(phones[0]);
  let phone2 = getPhone(phones[1]);

  if (!phone1 && phone2) {
    phone1 = phone2;
    phone2 = '';
  }

  if (phone1 === phone2) phone2 = '';

  return { phone1, phone2 };
};

const validEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const getEmail = (value = '') => {
  const email = value.replace(/ |(\.$)/g, '').toLowerCase();
  return validEmail(email) ? email : '';
};

const getEmails = value => {
  const emails = value.match(/(?:Адреса електронної пошти: )(.+)/m);
  if (!emails) return { email1: '', email2: '' };
  const emailList = emails[1].split(/,|;| {2}/).filter(el => el);

  let email1 = getEmail(emailList[0]);
  let email2 = getEmail(emailList[1]);

  if (!email1 && email2) {
    email1 = email2;
    email2 = '';
  }

  if (email1 === email2) email2 = '';

  return { email1, email2 };
};

const parseContacts = value => ({ ...getPhones(value), ...getEmails(value) });

const getStr = value => ((value && value[1]) || '').replace(/\s+/g, ' ').slice(0, 254);

const parseCapital = value => {
  const capitalMatch = value.match(/(?:Розмір.*?)(\d+)/);
  return (capitalMatch && +capitalMatch[1]) || 0;
};

const parseManager = value => getStr(value.match(/(^.+?)(?: (-|\d))/)).toUpperCase();

const parseDateRegistration = value => {
  const match = value.match(/(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})/);
  return match ? `${match.groups.year}-${match.groups.month}-${match.groups.day}` : null;
};

const parseActivity = value => (value.substring(0, value.indexOf('\n')) || value).replace(/;$/, '');

module.exports = organization => ({
  ...parseContacts(organization.contacts),
  capital: parseCapital(organization.dataAuthorizedCapital),
  manager: parseManager(organization.persons),
  dateRegistration: parseDateRegistration(organization.dateAndRecordNumber),
  activity: parseActivity(organization.activities)
});
