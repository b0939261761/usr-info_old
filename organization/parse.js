const getPhone = value => ((value && value[1]) || '').replace(/ /g, '').slice(-13);

const getStr = value => ((value && value[1]) || '').slice(0, 254);

const parseContacts = value => {
  const phones = [...value.matchAll(/(?:Телефон .: )(.+)/gm)];

  return {
    phone1: getPhone(phones[0]),
    phone2: getPhone(phones[1]),
    email: getStr(value.match(/(?:Адреса електронної пошти: )(.+)/m))
  };
};

const parseCapital = value => {
  const capitalMatch = value.match(/(?:Розмір.*?)(\d+)/);
  return (capitalMatch && +capitalMatch[1]) || 0;
};

const parseManager = value => getStr(value.match(/(^.+?)(?: -)/));

const parseDateRegistration = value => {
  const match = value.match(/(?<day>\d{2})\.(?<month>\d{2})\.(?<year>\d{4})/);
  return match ? `${match.groups.year}-${match.groups.month}-${match.groups.day}` : null;
};

module.exports = organization => ({
  ...parseContacts(organization.contacts),
  capital: parseCapital(organization.dataAuthorizedCapital),
  manager: parseManager(organization.persons),
  dateRegistration: parseDateRegistration(organization.dateAndRecordNumber)
});
