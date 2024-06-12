require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connection = require('./postgresSql');
const passport = require('passport');


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
app.use(passport.initialize());
app.use(passport.session());

connection();
app.get('/', (req, res) => res.send('API is running'));

//define routes
app.use('/verify-jwt', require('./routes/api/verifyToken'));
app.use('/stripe', require('./routes/api/stripe'));
app.use('/auth', require('./routes/api/auth'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});