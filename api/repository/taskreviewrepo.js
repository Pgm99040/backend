const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const tasktaskreview = mongoose.model('tasktaskreview');

exports.save = async(function (data) {
    return await(new tasktaskreview(data).save());
});

exports.gettaskReview = async(function (id) {
    return await(tasktaskreview.find({TaskEngagementId: id})
        .populate({path: 'subcategory', populate: {path: 'category'}})
        .lean())
});

exports.updatetaskReview = async(function (id, data) {
    return await(tasktaskreview.findOneAndUpdate({TaskReviewItemId: id}, {MentorTaskReviewTextForReviewItem : data}));
});

