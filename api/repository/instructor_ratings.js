const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

const instructorRating = mongoose.model('InstructorRating');

exports.save = async(function (data) {
    return await(new instructorRating(data).save());
});

exports.findOneReview = async(function (id) {
    return await(instructorRating.find({livesession: id}).populate({path: "user"}));
});
exports.avgRating = async(function (id) {
    return await(
        instructorRating.aggregate([
            {
                $match: {
                    livesession: id
                }
            },
            {
                $group: {
                    _id: null,
                    average_rating: { "$avg": "$rating_stars" }
                }
            }
        ])
    );
});