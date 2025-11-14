const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // if there's a valid Bearer token, refresh its expiry to 1 hour and propagate the new token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      try {
      // verify current token; if valid, issue a refreshed one with 1 hour expiry
      const decodedNow = jwt.verify(token, process.env.JWT_SECRET);
      const newToken = jwt.sign({ id: decodedNow.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // ensure subsequent code uses the refreshed token
      req.headers.authorization = 'Bearer ' + newToken;
      token = newToken;

      // return refreshed token to client (Authorization header and optional cookie)
      res.setHeader('Authorization', 'Bearer ' + newToken);
      if (typeof res.cookie === 'function') {
        res.cookie('token', newToken, { httpOnly: true, maxAge: 60 * 60 * 1000 });
      }
      } catch (err) {
      // do nothing here — later verification will handle invalid/expired tokens
      }
    }
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};