// load the things we need
const util = require('util')
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const activeTaskCount = require('../../config/properties')

let mongoose = require('mongoose');
const { MongoNetworkError } = require('mongodb');

// Required models ====================================
const Mentor = mongoose.model('Mentor');
const User = mongoose.model('User')

exports.save = async(function (data) {
    return await(new Mentor(data).save());
});

exports.update = async(function (id, data) {
    return await(Mentor.updateOne({_id: id}, data));
});

exports.findByIdAndUpdate = async(function (id, data) {
    return await(Mentor.findByIdAndUpdate({_id: id}, data));
})

exports.deleteRecord = async(function (id, data) {
    return await(Mentor.findByIdAndUpdate(id,data));
});

exports.findMentorWithId = async(function (id) {
    try {
         let mentor = await(Mentor.findOne({_id: id})
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .lean());
        return mentor;
    }
    catch(err) {
        return err;
    }

});

exports.updateMentorById = async(function (id, data) {
    return await(Mentor.findByIdAndUpdate({_id: id},data))
});

exports.findMentorId = async(function (id) {
    try {
         let mentor = await(Mentor.findOne({user: id})
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .lean());
        return mentor;
    }
    catch(err) {
        return err;
    }

});

exports.findMentorWithIds = async(function (ids) {
    return await(Mentor.find({_id: { $in: ids }
		})
    	.populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .lean())
});

exports.listMentor = async(function (id) {
    return await(Mentor.find({})
    	.populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .sort({createdAt: -1})
        .lean())
});

exports.getActiveMentors = async(function (userId,taskId) {
    return await(Mentor.find({ isApproved: true,
                isDefaultMentor: false,
                activeTaskCount: { $lt : activeTaskCount.activeTaskCountLimit },
                 // enable this in production
                 approvedTasksForMentorship:taskId
            })
            .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
            .populate('user')
            .lean())
});

exports.getDefaultActiveMentors = async(function (userId,taskId) {
    return await(Mentor.find({ isApproved: true,
            isDefaultMentor: true,
            activeTaskCount: { $lt : activeTaskCount.activeTaskCountLimit },// enable this in production
            approvedTasksForMentorship:taskId
        })
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .lean())
});

exports.listApprovedMentor = async(function (id) {
    return await(Mentor.find({ isApproved: true })
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate('user')
        .sort({createdAt: -1})
        .lean())
});

exports.mapTask = async(function(id, taskId) {
    try {
        let mentorFound = await(Mentor.findOne({_id: id}));
        mentorFound.activeTaskCount = mentorFound.activeTaskCount + 1
        mentorFound.activeTasks.push(taskId)
        mentorFound.taskEngagements.push(taskId)
        return await (mentorFound.save());
    } catch(err) {
        console.log(err)
        return err;
    }
})

exports.removeActiveTask = async(function(mentorId, taskEngagementId) {
    try {
        let mentorFound = await(Mentor.findOne({_id: mentorId}));
        if(mentorFound.activeTaskCount > 0) {
            mentorFound.activeTaskCount = mentorFound.activeTaskCount - 1
        }
        mentorFound.activeTasks.pull(taskEngagementId)
        return await (mentorFound.save());
    } catch(err) {
        console.log(err)
        return err;
    }
})

exports.getActiveTask = async(function (id) {
    let mentor = await(Mentor.findOne({_id: id}, {activeTasks: 1})
        .populate({path: 'activeTasks', populate: {path: 'task', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate({path: 'activeTasks', populate: {path: 'mentor', populate: {path: 'user'} } })
        .populate({path: 'activeTasks', populate: {path: 'payment'} })
        .lean());
    return mentor;
});

exports.findAssignDefaultMentor = async(function () {
    return await(Mentor.findOne({ assignDefaultMentor : true})
            .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
            .populate('user')
            .lean())
});


exports.getProfileDetails = async(mentorId)=>{
    return await Mentor.findOne({_id:mentorId})
    .populate('user')
    .populate({path:'taskEngagements',populate:{path:'user'}})
    .populate('approvedTasksForMentorship')
    .lean()
}

exports.getApprovedTasksMentor = async(taskId)=>{
    return await Mentor.find({isApproved: true,
         isDefaultMentor: false,
         approvedTasksForMentorship:taskId})
         .populate('user')
    .lean()
}

exports.getMentorId = async(userName)=>{
    return await User.findOne({userName:userName})
    .select('mentor')
    .lean()
}
