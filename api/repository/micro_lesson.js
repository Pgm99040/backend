const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const MicroLesson = mongoose.model('Micro_Lesson');

exports.save = async(function (data) {
    return await(new MicroLesson(data).save());
});
