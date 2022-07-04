// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var paymentSchema = new Schema({
  // Mandatory fields  

  taskPurchaseType:{type:String,enum:['credits','currency']},

  credits:{type:Number},

  currency:{type:String},

  paymentStatus: { type: String, required: true, lowercase: true, default: 'pending', enum: ['success', 'failure', 'pending'] },

  paymentMode: { type: String, required: false, lowercase: true, default: 'online', enum: ['online'] },

  paymentGateway: { type: String, required: false, lowercase: true, default: 'razorpay', enum: ['razorpay', 'paypal'] },

  razorPay: {
    razorpayId: { type: String, required: false, default: null },
    captured: { type: Boolean, required: false, default: false },
  },

  paypal: {
    transactionId  : { type: String, required: false, default: null },
    captured    : { type: Boolean, required: false, default: false},
  },
  // Timestamps 
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", default: null },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "PredefinedTask", default: null },
  taskEngagement: { type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement", default: null },

}, {
  timestamps: true
});

/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
paymentSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.__v
  return obj;
}

module.exports = mongoose.model('Payment', paymentSchema);