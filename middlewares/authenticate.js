'use strict';
const logger = require('../logger');
const errors = require('../utils').errors;
const tokens = require('../api/models/tokens');
const config = require('../config');

// Middleware to authenticate users and set req.user
module.exports.authenticate = function(role,anyOf){
  return function(req, res, next) {
    let header = req.header('Authorization');
    console.log("header----->", header);
    if (!header) {
      logger.error('Authorization Header missings');
      throw new Error(errors.tokenMissing);
       next({
          validation: false,
          message: errors.tokenMissing
        });
    }
    // let bearer = 'Bearer ';
    // let token = header.substr(bearer.length);

    tokens.verifyAndRefreshToken(header,{role,anyOf})
      .then(data => {
        req.role = data.role;
        req.token = data.token;
        req.user = data.user;
          next();
      })
      .catch(err => {
        logger.error('Error occurred while authenticating : ' + err);
        next({
          validation: false,
          message: errors.genericError
        });
      });
  }
}