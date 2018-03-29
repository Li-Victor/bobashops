import express from 'express';
import next from 'next';
import fetch from 'isomorphic-fetch';
import massive from 'massive';
import passport from 'passport';
import { Strategy } from 'passport-twitter';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

async function setup() {
  const dbConnection = await massive(process.env.DATABASE_URL);
  await app.prepare();
  const server = express();

  // set up auth
  server.use(
    session({
      store: new (connectPgSimple(session))({
        conString: process.env.DATABASE_URL
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
      }
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (id, cb) => {
    const user = await dbConnection.users.findOne({ id });
    if (user) cb(null, user);
    else cb(new Error(`User ${id} does not exist.`));
  });

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: `${process.env.REDIRECT_DOMAIN}/login/twitter/return`
      },
      async (accessToken, refreshToken, profile, cb) => {
        const { id, displayName } = profile;
        const user = await dbConnection.users.findOne({ id });
        if (user) cb(null, user);
        else {
          const newUser = await dbConnection.users.insert({ id, displayname: displayName });
          if (newUser) cb(null, newUser);
          else cb(new Error('Something has gone wrong with Twitter Auth'));
        }
      }
    )
  );

  server.use(passport.initialize());
  server.use(passport.session());
  server.get('/login/twitter', passport.authenticate('twitter'));
  server.get(
    '/login/twitter/return',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/'
    })
  );

  server.get('/shops', async (req, res) => {
    const { lat, long } = req.query;
    let response = await fetch(
      `https://api.yelp.com/v3/businesses/search?term=boba&latitude=${lat}&longitude=${long}&open_now=true`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`
        }
      }
    );
    response = await response.json();
    console.log(response);
    return res.send(response.businesses);
  });

  // initial data, need to get all shop and user info
  server.get('/init', async (req, res) => {
    const allShops = await dbConnection.countByShops();
    if (req.query.id) {
      let userShops = await dbConnection.log.find({ userid: req.query.id });
      userShops = userShops.map(userShop => userShop.bobaid);
      return res.json({ userShops, allShops, id: req.query.id });
    }
    return res.json({ allShops });
  });

  // user goes to boba shop, needs shop id as well as user id
  // returns updated shop and user info
  server.post('/gotoshop', async (req, res) => {
    const { userid, storeid } = req.query;
    console.log(userid, storeid);
    return res.send({});
  });

  // user cancels going to boba shop, needs shop id as well as user id
  // returns updated shop and user info
  server.delete('/cancel', async (req, res) => {
    console.log('here');
    if (!req.user) return res.end();
    console.log(res.user);
    return res.send(res.user);
  });

  server.get('*', (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
}

setup();
