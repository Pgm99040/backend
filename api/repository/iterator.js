const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Iterator = mongoose.model('Iterator');

exports.save = async( function (data) {
    return await(new Iterator(data).save());
});

exports.findAllIterator = async(function () {
    return await(Iterator.find({}));
});
exports.findIteratorByBatchId = async(function (id) {
    return await(Iterator.find({batchId: id}));
});
exports.removeIterator = async(function (id) {
    return await(Iterator.findByIdAndDelete({_id: id}));
});