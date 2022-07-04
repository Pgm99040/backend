// load the things we need
const util = require('util')
const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Category = mongoose.model('Category');

exports.save = async(function (data) {
    return await(new Category(data).save());
});

exports.update = async(function (id, data) {
    return await(Category.updateOne({_id: id}, data));
});

exports.delete = async(function (id) {
    return await(Category.remove({_id: id}));
});

exports.active = async (function (id) {
    return await(Category.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.deActive = async (function (id) {
    return await(Category.findByIdAndUpdate({_id: id}, {isActive : false}));
})

exports.findCategoryWithId = async(function (id) {
    let category = await(Category.findOne({_id: id})
        .populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
    	.lean());
    if(category) {
    	return category;
    }else {
    	return null
    }
});

exports.findCategoryWithIds = async(function (ids) {
    return await(Category.find({_id: { $in: ids }
		})
    	.populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
        .sort({createdAt: -1})
    	.lean())
});

exports.listCategory = async(function () {
    return await(Category.find({isActive: true})
    	.populate({path: 'subcategories', populate: {path: 'predefinedTasks'}})
        .sort({createdAt: -1})
    	.lean())
});

exports.listCategoryAll = async(function () {
    return await(Category.find({})
        // .populate({path: 'subcategories'})
        .sort({createdAt: -1})
        .lean())
});

/*exports.listCategoryWithOptions = async(function (options) {
    try {
        return await(Category.find({})
        .populate({path: 'subcategories', populate: {
            path: 'predefinedTasks',
            match: {
                    //difficultyLevel: options.difficultyLevel,
                    price: {
                        $lte: options.minPrice,
                        $gte: options.maxPrice
                    },
                },
            }
        })
        .sort({createdAt: -1})
        .lean())
    }catch(err) {
        console.log(err)
    }
});*/

/*exports.subcategoryMapping = async(function (categoryId, subcategoryId) {
    try {
        let categoryFound = await(Category.findOneAndUpdate({_id: categoryId}));
        categoryFound.subcategories.push(subcategoryId)
        return await (categoryFound.save());
    } catch(err) {
        console.log("subcategoryMapping: ",err)
        return err;
    }

});*/

exports.subcategoryMapping = async(function (categoryId, subcategoryId) {
    try {
         Category.findByIdAndUpdate(
              { _id: categoryId },
              { $push: { subcategories: subcategoryId  } },
              { new: false },
              function (err, category) {
                if(err) {
                    console.log("Something wrong when updating data");
                    return err;
                }
                return category;
            });
    } catch(err) {
        console.log("subcategoryMapping: ",err)
        return err;
    }

});
