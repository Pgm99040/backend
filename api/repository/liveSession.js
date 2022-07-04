const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const LiveSession = mongoose.model('LiveSession');

exports.save = async(function (data) {
    return await(new LiveSession(data).save());
});

exports.getAll = async(function () {
    return await(LiveSession.find({isActive : true}));
});

exports.active = async (function (id) {
    return await(LiveSession.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(LiveSession.findByIdAndUpdate({_id: id}, {isActive : false}));
})

exports.findIdWithSession = async(function (id) {
    return await(LiveSession.findOne({_id :id}));
});
exports.sortBatchSession = async(function (title) {
    return await(LiveSession.aggregate([
        {
            $match: {
                slug: title
            }
        },
        {
            $unwind: "$batches"
        },
        {
            $sort: {
                "batches.date": 1,
                "batches.duration": 1
            }
        },
        {
            $group:{
                "batches":{
                    $push: "$batches"
                },
                _id: 1
            }
        },
        {
            $sort: {
                "batches.date": 1,
                "batches.duration": 1
            }
        }
    ]))
});
exports.findByIdAndUpdate = async(function (id, data) {
    return await(LiveSession.findByIdAndUpdate({_id: id}, {$set: {batches:data}}));
});
exports.removeBatch = async(function (id, data) {
    return await(LiveSession.findByIdAndUpdate(id, data));
});

// exports.findSession = async(function (id) {
//     return await(LiveSession.findOne({_id :id}));
// });
