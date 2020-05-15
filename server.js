const express = require('express');

const app = express();
const port = process.env.SERVER_PORT_IN || 8080;

app.use(express.static('public'));

app.use(express.json());
app.use('/', require('./routes'));

app.use((err, req, res, next) => {
  const errors = err instanceof Array
    ? err.map(el => ({ stack: el.stack, ...el }))
    : { stack: err.stack, ...err };
  res.status(422).json(errors);
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
