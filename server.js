const express = require('express');

const app = express();
const port = process.env.SERVER_PORT || 8080;

app.use(express.json());
app.use('/', require('./routes'));

app.use((err, req, res, next) => res.status(422).send(err.message));

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
