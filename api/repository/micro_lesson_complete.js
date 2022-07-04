const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const MicroLessonComplete = require('../models/micro_lesson_complete');

exports.save = async(function (data) {
    return await(new MicroLessonComplete(data).save());
});
