const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Feed = mongoose.model('Feed');

exports.save = async(function (data) {
    return await(new Feed(data).save());
});

exports.active = async (function (id) {
    return await(Feed.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(Feed.findByIdAndUpdate({_id: id}, {isActive : false}));
})
