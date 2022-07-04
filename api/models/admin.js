// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var adminSchema = new Schema({
   // Mandatory fields  
  name        : { type : String, required : true, lowercase : false,}, 
  email       : { type : String, required : true, lowercase : false, index: { unique: true } },
  password    : { type : String, required : false, min: 6, max:15},
  adminType   : { type : String, required : false, trim : false, lowercase : false, enum : ['admin','superAdmin'] },  
  profilePicUrl : { type : String, required : false, default : null },
  // Timestamps 
  registeredOn  : { type : Date, default : Date.now },
  lastLoggedIn  : { type : Date, default : null},
  lastLoggedOut : { type : Date, default : null },

  isLoggedIn : { type : Boolean, required : false, default : false }

},
{
  timestamps: true
});

adminSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({
    email: email
  }).exec();
}

/**
 * Password hash middleware.
 */
adminSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

/**
 * Helper method for validating admin's password.
 */
 adminSchema.methods.validPassword = function(password, callback) {
     bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err) {
          return callback(err);
        }
          callback(null, isMatch)
      })
}

/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
 adminSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v
  return obj;
}

module.exports = mongoose.model('Admin', adminSchema);