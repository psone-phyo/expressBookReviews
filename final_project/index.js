const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;
const { JWT_SECRET } = require('./router/auth_users.js');

const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false,
}));

app.use('/customer/auth', (req, res, next) => {
  const bearer = req.get('Authorization');
  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : req.session.authorization?.accessToken;
  if (!token) return res.status(401).json({ message: 'Authorization token required.' });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token.' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
