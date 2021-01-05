const wrongActivities = [
  '01', '02', '03', '05', '06', '07', '08', '09', '64', '65', '66', '69.20', '84'
];

const validAddress = [
  'Київська обл.', 'місто Київ'
  // 'Тернопільська обл.', 'Львівська обл.',
  // 'Харківська обл.', 'Полтавська обл.'
];

const validationStayInformation = value => value === 'зареєстровано';
const validationAddress = value => validAddress.some(el => value.includes(el));
const validationActivity = value => !wrongActivities.some(el => value.startsWith(el));

export const validationUfop = org => validationStayInformation(org.stayInformation)
  && validationAddress(org.address)
  && validationActivity(org.activity);

export const validationParse = org => org.phone1 && validationUfop(org);

export default {
  validationUfop,
  validationParse
};
