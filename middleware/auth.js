const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //get the token from the header
  const token = req.header('x-auth-token');

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token,authorixation denied' });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));
    console.log('decoded user in middleware', decoded.user);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
