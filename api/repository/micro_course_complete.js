const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const MicroCourseComplete = mongoose.model('Micro_Course_Complete');

exports.save = async(function (data) {
    return await(new MicroCourseComplete(data).save());
});
