const { formatDate } = require('../utils/date.cjs');

const DELIMITER_CSV = ';';

const patternRemoveDelimiter = new RegExp(`${DELIMITER_CSV}|\\n`, 'g');
const trimSymbol = str => (typeof str === 'string' ? str.replace(patternRemoveDelimiter, ' ') : str);

const cols = [
  'index', 'id', 'status', 'code', 'fullName', 'legalForm', 'name',
  'manager', 'capital', 'phone1', 'phone2', 'email1', 'email2', 'dateRegistration',
  'address', 'founders', 'dataAuthorizedCapital', 'activity', 'activities', 'persons',
  'dateAndRecordNumber', 'contacts', 'stayInformation', 'createdAt', 'updatedAt'
];

const mapBody = (el, col) => {
  if (['createdAt', 'updatedAt'].includes(col)) return formatDate('DD.MM.YYYY HH:mm:ss', el[col]);
  if (col === 'dateRegistration') return formatDate('DD.MM.YYYY', el[col]);
  return trimSymbol(el[col]);
};

const rowToCsv = el => `${cols.map(col => mapBody(el, col)).join(DELIMITER_CSV)}\n`;

exports.rowToCsv = organization => rowToCsv(organization);

exports.header = `${[
  '#', 'ID', 'Статус запису', 'Код', 'Повне найменування',
  'Організаційно-правова форма', 'Назва', 'Керівник', 'Капітал',
  'Телефон 1', 'Телефон 2', 'Електронна пошта 1', 'Електронна пошта 2', 'Дата реєстрації',
  'Місце знаходження', 'Засновники', 'Дані про розмір статутного капіталу',
  'Вид діяльності', 'Види діяльності', 'Управління',
  'Дата та номер запису в реєстрі', 'Контакти',
  'Перебування у процесі припинення', 'Створення запису', 'Оновлення запису'
].join(DELIMITER_CSV)}\n`;
