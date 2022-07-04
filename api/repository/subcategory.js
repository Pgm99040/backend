// load the things we need
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Subcategory = mongoose.model('Subcategory');

// database operations
exports.save = async(function (data) {
    return await(new Subcategory(data).save());
});

exports.update = async(function (id, data) {
    return await(Subcategory.updateOne({_id: id}, data));
});

exports.delete = async(function (id) {
    return await(Subcategory.remove({_id: id}));
});

exports.findSubcategoryWithId = async(function (id) {
    return await(Subcategory.findOne({_id: id})
        .populate({path: 'category'/*, populate: {path: 'subcategories'}*/})
        .populate('predefinedTasks')
    	.lean())
});

exports.findSubcategoryWithIdWithoutPopulate = async(function (id) {
    return await(Subcategory.findOne({_id: id}).lean())
});

exports.findSubcategoryWithIds = async(function (ids) {
    return await(Subcategory.find({_id: { $in: ids }
        })
        .populate({path: 'category'/*, populate: {path: 'subcategories'}*/})
        .populate('predefinedTasks')
        .sort({createdAt: -1})
        .lean())
});


exports.listSubcategory = async(function (id) {
    return await(Subcategory.find({})
    	.populate({path: 'category'/*, populate: {path: 'subcategories'}*/})
        .populate('predefinedTasks')
        .sort({createdAt: -1})
    	.lean())
});

exports.findWithId = async(function (id) {
    return await(Subcategory.find({category: id, isActive: true}))
});
// exports.predefinedTaskMapping = async(function (subcategoryId, predefinedTaskId) {
//     try {
//         let subcategoryFound = await(Subcategory.findOne({_id: subcategoryId}));
//         subcategoryFound.predefinedTasks.push(predefinedTaskId)
//         return await (subcategoryFound.save());
//     } catch(err) {
//         return err;
//     }
// });

exports.predefinedTaskMapping = async(function (subcategoryId, predefinedTaskId) {
    try {
        Subcategory.findByIdAndUpdate(
          { _id: subcategoryId },
          { $push: { predefinedTasks: predefinedTaskId } },
          { new: false },
          function (err, subcategory) {
            if(err) {
                console.log("Something wrong when updating data");
                return err;
            }
            return subcategory
        });
    } catch(err) {
        return err;
    }
});

exports.active = async (function (id) {
    return await(Subcategory.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.deActive = async (function (id) {
    return await(Subcategory.findByIdAndUpdate({_id: id}, {isActive : false}));
})
