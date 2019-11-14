const wrongActivities = [
  '01', '02', '03', '05', '06', '07', '08', '09', '64', '65', '66', '69.20', '84'
];

const validationActivity = activity => !wrongActivities
  .some(el => el === activity.substr(9, el.length));

const validAddress = ['Київська обл.', 'м.Київ'];
const validationAddress = value => validAddress.some(el => value.includes(el));
const validationStayInformation = value => value === 'не перебуває в процесі припинення';


const filter = organization => {
  const {
    address, activity, stayInformation
  } = organization;

  if (validationStayInformation(stayInformation)
    && validationAddress(address)
    && validationActivity(activity)
  ) {
    console.log();
  } else {
    console.log(false);
  }
};

const org3 = {
  dataAuthorizedCapital: 'Розмір (грн.): 1000.00\nДата закінчення формування: 28.04.2020',
  persons: 'ПАРЧЕНКО ВІКТОР ОЛЕКСАНДРОВИЧ - керівник',
  contacts: 'Телефон 1: +380977386438\nАдреса електронної пошти: PANCHUKSM@UKR.NET',
  stayInformation: 'не перебуває в процесі припинення',
  address: '08131, м.Київ, Києво-Святошинський район, місто Вишневе, ВУЛИЦЯ БОГОЛЮБОВА, будинок 18, офіс 25',
  activity: 'Код КВЕД 55.11 Вирощування зернових культур (крім рису), бобових культур і насіння олійних культур'
};

filter(org3);


// const parseContacts = value => {
//   const phones = [...value.matchAll(/(?:Телефон .: )(.+)/gm)];
//   const phone1 = phones[0] && phones[0][1];
//   const phone2 = phones[1] && phones[1][1];

//   const emailMatch = value.match(/(?:Адреса електронної пошти: )(.+)/m);
//   const email = emailMatch && emailMatch[1];

//   return { phone1, phone2, email };
// };

// const parseCapital = value => {
//   const capitalMatch = value.match(/(?:Розмір.*?)(\d+)/);
//   return capitalMatch && +capitalMatch[1];
// };

// const parseManager = value => {
//   const managerMatch = value.match(/(^.+?)(?: -)/);
//   return managerMatch && managerMatch[1];
// };

// const { phone1, phone2, email } = parseContacts(contacts);
//   const capital = parseCapital(dataAuthorizedCapital);
//   const manager = parseManager(persons);
