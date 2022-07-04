var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const logger = require('../../logger');
const config = require('../../config');

const User = mongoose.model('User');
const Admin = mongoose.model('Admin');

const _this = this;

if(config.env == 'dev') {
  const masterToken = config.masterToken;
}
// Create new token based on phone number and platform.
module.exports.createNewToken = function(role, data, platform) {
  var payload =getPayload(role,data,platform);
    console.log("-----pay-----", payload);
  var token = jwt.sign(payload, config.jwtSecretKey, {
    expiresIn: '30d'
  });
    console.log("token----->new", token)
  return token;
}

module.exports.verifyAndRefreshToken = function(token,role,refresh=true) {
    console.log("role", role)
    console.log("token---->", token.split(" "));
  let isToken = token && token.split(" ");
  let checkMultiple = false;
  if(typeof object == 'string' && role.anyOf) {
      checkMultiple = true;
  } 
  role = role.role || role;
  return new Promise(function(resolve, reject) {
        try {
            var payload = jwt.verify((isToken[0] !== "Bearer") ? isToken[0] : isToken[1], config.jwtSecretKey);
            console.log("payload", payload);
            if(role === payload.role ||( checkMultiple && role.anyOf.indexOf(payload.role) > -1)) {
                role = payload.role;
                return getData(role,payload.email)
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
            if (err.name === 'TokenExpiredError' ) {
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
};

module.exports.verifyAndRefreshTokenForNonAuth = function (token) {
    let isToken = token && token.split(" ");
    return new Promise(function(resolve, reject) {
        try {
            const payload = jwt.verify((isToken[0] !== "Bearer") ? isToken[0] : isToken[1], config.jwtSecretKey);
            return getData1(payload.email)
                .then(data => {
                    data.token = token;
                    resolve(data)
                })
                .catch(err => {
                    reject(err);
                })
        } catch (err) {
            logger.error('Error occurred while verifying token: ' + err);
            // If token is expired, create a new token and return.
            // if (err.name === 'TokenExpiredError' ) {
            //     if(refresh) {
            //         const oldPayload = jwt.decode(token, config.jwtSecretKey);
            //         const key = oldPayload.key;
            //         const platform = oldPayload.platform;
            //             return getData(payload.key)
            //                 .then(data => {
            //                     var newToken = _this.createNewToken(data,platform);
            //                     data.token = token;
            //                     return resolve(data)
            //                 })
            //     } else {
            //         reject({
            //             message: 'Session has Expired'
            //         });
            //     }
            // } else {
            //     reject(err);
            // }
        }
    });
};

async function getData1 (key)  {
    const userDeatil = await User.findOne({email: key}).select("email profilePicUrl status isMentor firstName lastName");
    const adminDetail = await Admin.findOne({email: key})
    if (userDeatil) {
        return Promise.resolve({
            user: userDeatil,
        });
    }
    if (adminDetail) {
        return Promise.resolve({
            admin: adminDetail,
        })
    }
};

function  getData (role,key) {
    switch(role) {
        case 'user' :
            return User.findOne({email: key}).select("email profilePicUrl status isMentor firstName lastName")
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
            return Admin.findOne({email: key})
            .then(admin => {
            return Promise.resolve({
                admin: admin,
                role: 'admin'
            })
            })
            .catch(err => {
            return Promise.reject(err);
            })
        default  :
            return Admin.findOne({email: key})
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
        payload.key = data.email;
        return payload;
        case 'admin':
        payload.key = data.email;
        payload.adminRoles = data.roles;
        return payload;
        default :
        payload.key = data.email;
        return payload;
        
    }
}


