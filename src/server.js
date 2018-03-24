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

  server.get('*', (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
}

setup();
