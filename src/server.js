// @flow

import express from 'express';
import next from 'next';
import fetch from 'isomorphic-fetch';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/shops', (req, res) => {
    const { lat, long } = req.query;
    fetch(
      `https://api.yelp.com/v3/businesses/search?term=boba&latitude=${lat}&longitude=${long}&open_now=true`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`
        }
      }
    )
      .then(response => response.json())
      .then(response => {
        console.log(response);
        return res.send(response.businesses);
      })
      .catch(err => console.log(err));
  });

  server.get('*', (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
});
