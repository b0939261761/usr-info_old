const { formatDate } = require('../utils/date');

const DELIMITER_CSV = ';';

const patternRemoveDelimiter = new RegExp(`${DELIMITER_CSV}|\\n`, 'g');
const trimSymbol = str => (typeof str === 'string' ? str.replace(patternRemoveDelimiter, ' ') : str);


const cols = [
  'index', 'id', 'status', 'code', 'fullName', 'legalForm', 'name',
  'manager', 'capital', 'phone1', 'phone2', 'email', 'dateRegistration',
  'address', 'founders', 'dataAuthorizedCapital', 'activity', 'activities', 'persons',
  'dateAndRecordNumber', 'contacts', 'stayInformation', 'createdAt', 'updatedAt'
];

const formatDateAt = formatDate.bind(null, 'DD.MM.YY HH:mm:ss');

const mapBody = (el, col) => (
  ['createdAt', 'updatedAt'].includes(col) ? formatDateAt(el[col]) : trimSymbol(el[col])
);

const rowToCsv = el => `${cols.map(col => mapBody(el, col)).join(DELIMITER_CSV)}\n`;

exports.rowToCsv = organization => rowToCsv(organization);

exports.header = `${[
  '#', 'ID', 'Статус запису', 'Код', 'Повне найменування',
  'Організаційно-правова форма', 'Назва', 'Керівник', 'Капітал',
  'Телефон 1', 'Телефон 2', 'Електронна пошта', 'Дата реєстрації',
  'Місце знаходження', 'Засновники', 'Дані про розмір статутного капіталу',
  'Вид діяльності', 'Види діяльності', 'Управління',
  'Дата та номер запису в реєстрі', 'Контакти',
  'Перебування у процесі припинення', 'Створення запису', 'Оновлення запису'
].join(DELIMITER_CSV)}\n`;
