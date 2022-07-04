// load the things we need
const util = require('util')
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const User = mongoose.model('User');
const TaskEngagement = mongoose.model('TaskEngagement');
const PredefinedTask = mongoose.model('PredefinedTask');

exports.save = async(function (data) {
    return await(new User(data).save());
});

exports.update = async(function (id, data) {
    return await(User.updateOne({_id: id}, data));
});

exports.delete = async(function (id) {
    return await(User.remove({_id: id}));
});

exports.findUserWithEmail = async(function (email) {
    let user = await(User.findOne({email: email})
        .populate('mentor')
        .populate({path: 'activeTasks', populate: {path: 'task', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .lean());
    return user;
});
exports.findUserWithId = async(function (id) {
    let user = await(User.findOne({_id: id})
        .populate({path: 'taskEngagements', populate: {path: 'predefinedTasks', populate: {path: 'subcategory', populate: {path: 'category'}}}})
    	.lean());
    return user;
});

exports.findUserWithIds = async(function (ids) {
    return await(User.find({_id: { $in: ids }
		})
    	.populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
    	.lean())
});

exports.listUser = async(function (id) {
    return await(User.find({})
    	.sort({createdAt: -1})
    	.populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
    	.lean())
});
exports.findIsMentorsTrue = async(function (id) {
    return await(User.find({isMentor: true})
    	.sort({createdAt: -1})
    	.populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
    	.lean())
});

exports.findUser = async(function (email) {
   return await(User.find({email: email}))
});
exports.userLoginAccess = async(function (id, data) {
   return await(User.findByIdAndUpdate({_id: id}, {status: data},  { new: true }))
});

exports.findMentor = async(function (email) {
    return await(User.find({email: email}))
});

exports.mapTask = async(function(id, taskId) {
    try {
        let userFound = await(User.findOne({_id: id}));
        userFound.activeTaskCount = userFound.activeTaskCount + 1
        userFound.activeTasks.push(taskId)
        userFound.taskEngagements.push(taskId)
        return await (userFound.save());
    } catch(err) {
        return err;
    }
})


exports.removeActiveTask = async(function(userId, taskEngagementId) {
    try {
        let userFound = await(User.findOne({_id: userId}));
        if(userFound.activeTaskCount > 0) {
            userFound.activeTaskCount = userFound.activeTaskCount - 1;
        }
        userFound.activeTasks.pull(taskEngagementId)
        return await (userFound.save());
    } catch(err) {
        return err;
    }
})

exports.getActiveTask = async(function (id) {
    let user = await(User.findOne({_id: id}, {activeTasks: 1})
        .populate({path: 'activeTasks', populate: {path: 'task', populate: {path: 'subcategory', populate: {path: 'category'}}}})
        .populate({path: 'activeTasks', populate: {path: 'mentor', populate: {path: 'user'} } })
        .populate({path: 'activeTasks', populate: {path: 'payment'} })
        .lean());
    return user;
});


exports.editProfile = async(userId,updateObj)=>{
    return await User.findByIdAndUpdate(userId,updateObj,{new:true,safe:true})
}

// exports.getProfileDetails = async(userId)=>{
//     return await User.findOne({_id:userId})
//     .populate({path:'taskEngagements',select:'task',populate:{path:'task'}})
// }

exports.getProfileDetails = async(userId)=>{
    const UserDetail = await User.findOne({_id: userId})
    let tasks = []
    const taskEngagement = await TaskEngagement.find({status: "completed"})
    for (const item of taskEngagement) {
        const task = await PredefinedTask.find({_id: item.task})
        tasks = tasks.concat(task)
    };
    let data = {...UserDetail._doc}
    const filteredArr = tasks.filter(function (a) {
        return !this[a._id] && (this[a._id] = true);
    }, Object.create(null));
    data.taskEngagements = filteredArr
    return data
};

exports.addBonusCredits = async(userId,updateObj)=>{
    return await User.findByIdAndUpdate(userId,updateObj,{new:true,safe:true})
}


exports.findIfUserNameExists = async(userId,userName)=>{
    return await User.find({$and:[{ _id: { $nin: [userId] } },{userName:{$in:[userName]}}]}).lean()
}

exports.findUserIdByName = async(userName)=>{
    return await User.find({userName:userName}).select('_id').lean()
}

exports.fetchCredits = async(userId)=>{
    return await User.findOne({_id:userId}).select('credits').lean()
}
