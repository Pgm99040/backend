// load the things we need
const util = require('util')
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const TaskEngagement = mongoose.model('TaskEngagement');

exports.save = async(function (data) {
    try {
        return await(new TaskEngagement(data).save());
    }catch(err) {
        console.log(err)
    }

});

exports.update = async(function (id, data) {
    try {
        return await(TaskEngagement.findByIdAndUpdate({_id: id}, data));
    }catch(err) {
        console.log(err)
    }
});
exports.createGMeet = async(function (id, data) {
    try {
        return await(TaskEngagement.updateOne({_id: id}, {gmeetLinkUrl: data}));
    }catch(err) {
        console.log(err)
    }
});

exports.delete = async(function (id) {
    try {
        return await(TaskEngagement.remove({_id: id}));
    }catch(err) {
        console.log(err)
    }
});

exports.findTaskEngagementWithId = async(function (id) {
    return await(TaskEngagement.findOne({_id: id})
        .populate({path: 'task', populate: { path: 'subcategory', populate: {path: 'category'} } })
        .populate('user')
        .populate({path: 'mentor', populate: { path: 'user' } })
        .populate('payment')
    	.lean())
});

exports.findTaskEngagementWithIds = async(function (ids) {
    return await(TaskEngagement.find({_id: { $in: ids }
		})
        .populate({path: 'task', populate: {path: 'category'}, populate: {path: 'subcategory'}})
        .populate('user')
        .populate({path: 'mentor', populate:{path:'user'}})
        .populate('payment')
        .sort({createdAt: -1})
    	.lean())
});

exports.findTaskEngagementWithTaskId = async(function (ids) {
    return await(TaskEngagement.find({task: { $in: ids }
    })
        .populate({path: 'task', populate: {path: 'category'}, populate: {path: 'subcategory'}})
        .populate('user')
        .populate({path: 'mentor', populate:{path:'user'}})
        .populate('payment')
        .sort({createdAt: -1})
        .lean())
});

exports.listTaskEngagement = async(function () {
    return await(TaskEngagement.find({})
    	.populate({path: 'task', populate: {path: 'category'}, populate: {path: 'subcategory'}})
        .populate({path: 'mentor', populate: {path: 'user'}})
        .populate({path: 'user', populate: {path:'mentor'}})
        .populate('payment')
        .sort({createdAt: -1})
    	.lean())
});

exports.updateSubmissionArray = async(function(id, data) {
    try {
        let taskEngagementFound = await(TaskEngagement.findOne({_id: id}));
        taskEngagementFound.submissions.push(data)
        return await (taskEngagementFound.save());
    } catch(err) {
        return err;
    }
})

exports.updateDiscussionArray = async(function(id, data) {
    try {
        let taskEngagementFound = await(TaskEngagement.findOne({_id: id}));
        taskEngagementFound.discussions.push(data)
        return await (taskEngagementFound.save());
    } catch(err) {
        return err;
    }
})

exports.userTasks = async(function (id) {
    return await(TaskEngagement.find({user: id})
    	.populate({path: 'task', populate: {path: 'category'}, populate: {path: 'subcategory'}})
        .populate('user')
        .populate({path: 'mentor', populate:{path:'user'}})
        .populate('payment')
        .sort({createdAt: -1})
    	.lean())
});

exports.mentorTasks = async(function (id) {
    return await(TaskEngagement.find({mentor: id})
    	.populate({path: 'task', populate: {path: 'category'}, populate: {path: 'subcategory'}})
        .populate('user')
        .populate({path: 'mentor', populate:{path:'user'}})
        .populate('payment')
        .sort({createdAt: -1})
    	.lean())
});

exports.getAverageRatingofMentor = async(function (mentorId) {
    return await(
        TaskEngagement.aggregate([
            {
                $match: {
                    mentor: mentorId
                }
            },
            {
                $group: {
                    _id: null,
                    avg_rating_of_mentor: { "$avg": "$rating.user2mentor" }
                }
            }
        ])
    )
});

exports.getAverageRatingofUser = async(function (userId) {
    return await(
        TaskEngagement.aggregate([
            {
                $match: {
                    user: userId
                }
            },
            {
                $group: {
                    _id: null,
                    avg_rating_of_user: { "$avg": "$rating.mentor2user" }
                }
            }
        ])
    )
});

