const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const MicroCourse = mongoose.model('Micro_Course');

exports.save = async(function (data) {
    return await(new MicroCourse(data).save());
});

exports.active = async (function (id) {
    return await(MicroCourse.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(MicroCourse.findByIdAndUpdate({_id: id}, {isActive : false}));
})
