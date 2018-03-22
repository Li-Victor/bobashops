// @flow

import express from 'express';
import next from 'next';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('*', (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
});
