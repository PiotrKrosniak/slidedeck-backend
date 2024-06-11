require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connection = require('./postgresSql');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_KEY, // Change this to a random secret
  resave: false, 
  saveUninitialized: true 
}));

// Place session middleware before passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
(token, tokenSecret, profile, done) => {
  return done(null, profile);
}));

connection();
app.get('/', (req, res) => res.send('API is running'));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect((`http://localhost:3000/?id=${req.user.id}&displayName=${req.user.displayName}&picture=${req.user._json.picture}`));
  }
);

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('http://localhost:3000');
  });
});

//define routes
app.use('/verify-jwt', require('./routes/api/verifyToken'));
app.use('/stripe', require('./routes/api/stripe'));
// app.use('/auth', require('./routes/api/auth'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});