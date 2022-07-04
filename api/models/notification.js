// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var notificationSchema = new Schema({
   // Mandatory fields  
    notificationType : { type : String, required : false, lowercase : true, enum: ["requestTask"]},  
    user    : { type: mongoose.Schema.Types.ObjectId, ref: "User"}, 
    mentor  : { type: mongoose.Schema.Types.ObjectId, ref: "Mentor"},
    taskEngagement : { type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement"},  

},
{
  timestamps: true
});
/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
 notificationSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v
  return obj;
}

module.exports = mongoose.model('Notification', notificationSchema);