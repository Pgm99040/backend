// Models
const Admin = require('./models/admin');
const User= require('./models/user');
const Mentor= require('./models/mentor');

const Promise = require('bluebird');
const config = require('../config');
const jwt = require('jsonwebtoken');

//Loggers
const logger = require('../logger');

const _this = this;

if(config.env == 'dev') {
  const masterToken = config.masterToken;
}
// Create new token based on phone number and platform.
module.exports.createNewToken = function(role, data, platform) {
  var payload =getPayload(role,data,platform)
  var token = jwt.sign(payload, config.jwtSecretKey, {
    expiresIn: '30d'
  });
  return token;
}

module.exports.verifyAndRefreshToken = function(token,role,refresh=true) {
  let checkMultiple = false;
  if(typeof object == 'string' && role.anyOf) {
      checkMultiple = true;
  } 
  role = role.role || role;
  return new Promise(function(resolve, reject) {
        try {
            var payload = jwt.verify(token, config.jwtSecretKey);
            if(role === payload.role ||( checkMultiple && role.anyOf.indexOf(payload.role) > -1)) {
                role = payload.role;
                return getData(role,payload.key)
                    .then(data => {
                        data.token = token;
                    resolve(data)
                    })
                    .catch(err => {
                    reject(err);
                })
            } else {
                reject()
            }
        } catch (err) {
            logger.error('Error occurred while verifying token: ' + err);
            // If token is expired, create a new token and return.
            if (err.name == 'TokenExpiredError' ) {
                if(refresh) {
                    var oldPayload = jwt.decode(token, config.jwtSecretKey);
                    var key = oldPayload.key;
                    var platform = oldPayload.platform;
                    if(role === oldPayload.role ||( checkMultiple && role.anyOf.indexOf(oldPayload.role) > -1)) {
                    role = payload.role;
                    return getData(role,payload.key)
                    .then(data => {
                        var newToken = _this.createNewToken(data,role,platform);
                        data.token = token;
                        return resolve(data)
                    })
                    } else {
                        reject()
                    }
                } else {
                    reject({
                        message: 'Session has Expired'
                    });
                }
            } else {
                reject(err);
            }
        }
  });
}

function  getData (role,key) {
    switch(role) {
        case 'user' :
            return User.findByPhoneNumber(key)
            .then(user => {
                return Promise.resolve({
                user: user,
                role:'user'
                });
            })
            .catch(err => {
                return Promise.reject(err);
            });
        case 'admin' :
            return Admin.findByUsername(key)
            .then(admin => {
            return Promise.resolve({
                admin: admin,
                role: 'admin'
            })
            })
            .catch(err => {
            return Promise.reject(err);
            })
    }
}

function getPayload(role,data,platform) {
    let payload = {role};
    payload.id = data.id;
    payload.platform = data.platform || platform;
    switch(role) {
        case 'user': 
        payload.key = data.phoneNumber;
        return payload;
        case 'admin':
        payload.key = data.username;
        payload.adminRoles = data.roles;
        return payload;
        default :
        payload.key = data.username;
        payload.hospitalId = data.hospitalId;
        payload.isSuperUser = data.isSuperUser
        return payload;
        
    }
}


