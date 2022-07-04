const async = require('asyncawait/async');
const await = require('asyncawait/await');
// const {ObjectId} = require('mongoose');

let mongoose = require('mongoose');

// Required models ====================================
const TestSelectAns = mongoose.model('TestSelectAns');

exports.getTestSelectAns = async(function () {
    return await(TestSelectAns.find({}));
});

exports.addTestSelectAns=async(function (data) {
    return await(new TestSelectAns(data).save());
})

exports.UpdateSelectAns=async(function (id,data) {
    try {
        return await(TestSelectAns.findOneAndUpdate({testId: id}, data));
    }catch(err) {
        console.log(err)
    }
})