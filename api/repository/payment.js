// load the things we need
const util = require('util') 
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Payment = mongoose.model('Payment');

const CreditPayment = mongoose.model('creditpayment')

const User = mongoose.model('User')

exports.save = async(function (data) {
    return await(new Payment(data).save());
});

exports.update = async(function (id, data) {
    return await(Payment.updateOne({_id: id}, data));
});

exports.delete = async(function (id) {
    return await(Payment.remove({_id: id}));
});


exports.findPaymentWithId = async(function (id) {
    let Payment = await(Payment.findOne({_id: id})
        .populate({path: 'task'})
    	.lean());
    if(payment) {
    	return payment;
    }else {
    	return null
    }
});

exports.findPaymentWithIds = async(function (ids) {
    return await(Payment.find({task: { $in: ids }
		})
        .populate({path: 'task'})
        .populate({path: 'user'})
        .populate({path: 'mentor', populate: {path: 'user'}})
        .populate({path: 'taskEngagement'})
        .sort({createdAt: -1})
        .lean())
});

exports.listPayment= async(function (id) {
    return await(Payment.find({})
        .populate({path: 'task'})
        .populate({path: 'user'})
        .populate({path: 'mentor', populate: {path: 'user'}})
        .populate({path: 'taskEngagement'})
        .sort({createdAt: -1})
        .lean())
});

exports.userHistory= async(function (id) {
    return await(Payment.find({user: id})
        .populate({path: 'task'})
        .sort({createdAt: -1})
    	.lean())
});

exports.mentorHistory= async(function (id) {
    return await(Payment.find({mentor: id})
        .populate({path: 'task'})
        .sort({createdAt: -1})
    	.lean())
});


exports.saveCreditPayment = async(data)=>{
    return await CreditPayment.create(data)
}

exports.updateCredits = async(credits,userId)=>{
    return await User.findByIdAndUpdate(userId,{$inc:{credits:credits}})
}

exports.creditHistory = async(userId)=>{
   let credhist= await CreditPayment.find({user:userId}).sort({createdAt:-1}).lean()
   let bonuscreds = await User.find({_id:userId}).select('bonusCreditDetails').lean()
   return [...credhist,...bonuscreds[0].bonusCreditDetails]
}

exports.findWithIdTaskId= async(function (id, userId) {
    return await(Payment.findOne({$and: [{ task: id }, { user: userId }]})
        .populate({path: 'task'})
        .populate({path: 'user'})
        .populate({path: 'mentor', populate: {path: 'user'}})
        .populate({path: 'taskEngagement'})
        .sort({createdAt: -1})
        .lean())
});
