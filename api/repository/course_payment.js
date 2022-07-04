const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const CoursePayment = mongoose.model('course_Payment');

exports.save = async(function (data) {
    return await(new CoursePayment(data).save());
});
