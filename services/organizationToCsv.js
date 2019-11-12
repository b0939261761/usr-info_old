const { formatDate } = require('../utils/date');

const DELIMITER_CSV = ';';

const patternRemoveDelimiter = new RegExp(`${DELIMITER_CSV}|\\n`, 'g');
const trimSymbol = str => (typeof str === 'string' ? str.replace(patternRemoveDelimiter, ' ') : str);

const header = [
  '#', 'ID', 'Статус запису', 'Код', 'Повне найменування',
  'Організаційно-правова форма', 'Назва', 'Місце знаходження',
  'Засновники', 'Дані про розмір статутного капіталу', 'Вид діяльності',
  'Види діяльності', 'Управління', 'Дата та номер запису в реєстрі',
  'Контакти', 'Перебування у процесі припинення',
  'Створення запису', 'Оновлення запису'
].join(DELIMITER_CSV);

const cols = [
  'index', 'id', 'status', 'code', 'fullName', 'legalForm', 'name',
  'address', 'founders', 'dataAuthorizedCapital', 'activity', 'activities', 'persons',
  'dateAndRecordNumber', 'contacts', 'stayInformation', 'createdAt', 'updatedAt'
];

const formatDateAt = formatDate.bind(null, 'DD.MM.YY HH:mm:ss');

const rowToCsv = el => cols
  .map(col => (['createdAt', 'updatedAt'].includes(col) ? formatDateAt(el[col]) : trimSymbol(el[col])))
  .join(DELIMITER_CSV);

const bodyToCsv = (acc, cur, index) => `${acc}\n${rowToCsv({ index: index + 1, ...cur })}`;

// ---------------

module.exports = organizations => organizations.reduce(bodyToCsv, header);
