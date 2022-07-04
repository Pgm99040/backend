// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var creditpaymentSchema = new Schema({
    // Mandatory fields  

    // purchaseId: { type: String },
    credits: { type: Number },
    amountPaid: { type: String },
    paymentStatus: { type: String, required: true, lowercase: true, default: 'pending', enum: ['success', 'failure', 'pending'] },

    paymentMode: { type: String, required: false, default: 'online', enum: ['online', 'ADMIN_FREE_GRANT'] },

    paymentGateway: { type: String, required: false, lowercase: true, default: 'razorpay', enum: ['razorpay', 'paypal'] },
    // paymentGateway: { type: String, required: false, lowercase: true },


    razorPay: {
        razorpayId: { type: String, required: false, default: null },
        captured: { type: Boolean, required: false, default: false },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: false, default: null }
   
}, {
    timestamps: true
});

/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
creditpaymentSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v
    return obj;
}

module.exports = mongoose.model('creditpayment', creditpaymentSchema);