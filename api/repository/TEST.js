const async = require('asyncawait/async');
const await = require('asyncawait/await');

// const {ObjectId} = require('mongoose');

let mongoose = require('mongoose');

// Required models ====================================
const test = mongoose.model('TEST');

exports.save = async(function (data) {
    return await(new test({...data, TestId : new mongoose.Types.ObjectId()}).save());
});

exports.getTest = async(function () {
    return await(test.find({}));
});

exports.getEachTest = async(function (data) {
    console.log('data',data)
    return await(test.find({TestId:data.TestId}));
});




