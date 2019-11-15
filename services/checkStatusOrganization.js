const wrongActivities = [
  '01', '02', '03', '05', '06', '07', '08', '09', '64', '65', '66', '69.20', '84'
];

const validAddress = ['Київська обл.', 'м.Київ'];

const validationStayInformation = value => value === 'не перебуває в процесі припинення';
const validationAddress = value => validAddress.some(el => value.includes(el));
const validationActivity = value => !wrongActivities.some(el => el === value.substr(9, el.length));

module.exports = organization => organization.phone1
  && validationStayInformation(organization.stayInformation)
  && validationAddress(organization.address)
  && validationActivity(organization.activity);
