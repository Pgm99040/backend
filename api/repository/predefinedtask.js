// load the things we need
const util = require('util')
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const PredefinedTask = mongoose.model('PredefinedTask');

exports.save = async(function (data) {
    return await(new PredefinedTask(data).save());
});

exports.update = async(function (id, data) {
    console.log("id--->", id);
    return await(PredefinedTask.findByIdAndUpdate({_id: id}, data));
});

exports.delete = async(function (id) {
    return await(PredefinedTask.findByIdAndUpdate({_id: id}, {isActive : false}));
});

exports.active = async(function (id) {
    return await(PredefinedTask.findByIdAndUpdate({_id: id}, {isActive : true}));
});

exports.findPredefinedTaskWithId = async(function (id) {
    const detail =  await(PredefinedTask.findOne({_id: id})
    	.populate({path: 'subcategory', populate: {path: 'category'}})
    	.lean())
    delete detail.taskDetailedDescriptionForMentee;
    return detail
});

exports.findPredefinedDetailTaskWithId = async(function (id) {
    return await(PredefinedTask.findOne({_id: id})
        .populate({path: 'subcategory', populate: {path: 'category'}})
        .lean())
});

exports.findPredefinedTaskWithIds = async(function (ids) {
    return await(PredefinedTask.find({_id: { $in: ids }
		})
    	.populate({path: 'subcategory', populate: {path: 'category'}})
        .populate('')
        .sort({createdAt: -1})
    	.lean())
});

exports.listPredefinedTask = async(function (id) {
    return await(PredefinedTask.find({isActive : true})
    	.sort({createdAt: -1})
    	.populate({path: 'subcategory', populate: {path: 'category'}})
        .sort({createdAt: -1})
    	.lean())
});

exports.predefinedTaskMapping = async(function (PredefinedTaskId, subPredefinedTaskId) {
    try {
        let predefinedTaskFound = await(PredefinedTask.findOne({_id: PredefinedTaskId}));
        predefinedTaskFound.subcategories.push(subPredefinedTaskId)
        return await (predefinedTaskFound.save());
    } catch(err) {
        return err;
    }
});


exports.listPredefinedTaskWithOptions = async(function (category, subcategory, options) {
    try {
        let minPrice = 0;
        let maxPrice = 0;
        let query = {
                category: { $in: category }
            }
        if(subcategory.length > 0) {
            query.subcategory = { $in: subcategory };
        }
        if(options.difficultyLevel != undefined && options.difficultyLevel != null) {
            query.difficultyLevel= options.difficultyLevel;
        }
        if(options.minPrice != undefined && options.maxPrice!=null) {
            query.credits = { $gt: options.minPrice, $lt: options.maxPrice }
        }

        return await(PredefinedTask.find(query)
        .populate({path: 'subcategory', populate: {path: 'category'}})
        .sort({createdAt: -1})
        .lean())
    }catch(err) {
        console.log(err)
        return err;
    }
});
//searchTaskByRegEx with options
exports.searchTaskByRegEx = async(function(category, subcategory, options, searchText) {
    try {
        let query = {}
        query.name = { $regex: '^'+searchText, $options: "i" }
        let minPrice = 0;
        let maxPrice = 0;
        if( category.length > 0 ) {
            query.category=  { $in: category }
        }
        if(subcategory.length > 0) {
            query.subcategory = { $in: subcategory }
        }
        if(options.difficultyLevel != undefined && options.difficultyLevel != null) {
            query.difficultyLevel= options.difficultyLevel;
        }
        if(options.minPrice != undefined && options.maxPrice!=undefined) {
            query.credits = { $gt: options.minPrice, $lt: options.maxPrice }
        }
        console.log("query", query)
        return await(PredefinedTask.find(query)
                    .populate({path: 'subcategory', populate: {path: 'category'}})
                    .sort({createdAt: -1})
                    .lean())
    }catch(err) {
        coonsole.log(err)
        return err;
    }
})

//searchTaskByRegEx with name only
// exports.searchTaskByRegEx = async(function(searchText) {
//     try {

//         return await(PredefinedTask.find({
//            name: { $regex: '^'+searchText, $options: "i" }
//         })
//         //.populate({path: 'category'})
//         .populate({path: 'subcategory', populate: {path: 'category'}})
//         .sort({createdAt: -1})
//         .lean())
//     }catch(err) {
//         coonsole.log(err)
//         return err;
//     }
// })

exports.sortByOptions = async(function(options) {

    if(options.sortType == "sortByDate") {
        let createdAt = -1;
        createdAt = options.newToOld  ?   -1    :     +1;
        try {
            return await(PredefinedTask.find({})
            //.populate({path: 'category'})
            .populate({path: 'subcategory', populate: {path: 'category'}})
            .sort({ createdAt: createdAt })
            .lean())
        }catch(err) {
            coonsole.log(err)
            return err;
        }
    }
    if(options.sortType == "sortByPrice") {
        let price = -1;
        price = options.highToLow ?   -1    :     +1;
        try {
            return await(PredefinedTask.find({})
            //.populate({path: 'category'})
            .populate({path: 'subcategory', populate: {path: 'category'}})
            .sort({ credits: price })
            .lean())
        }catch(err) {
            coonsole.log(err)
            return err;
        }
    }
})

exports.bulkInsert = async(function (docs) {
    return await(PredefinedTask.insertMany(docs));
});

exports.updateReview = async(function (id, data) {
    return await(PredefinedTask.findByIdAndUpdate({_id: id}, {review : data.review}));
});

exports.getReview = async(function (id) {
    console.log("data",id)
    return await(PredefinedTask.findOne({_id: id.id})
        .populate({path: 'subcategory', populate: {path: 'category'}})
        .lean())
});
