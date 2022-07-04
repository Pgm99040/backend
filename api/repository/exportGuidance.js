const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const ExportGuidance = mongoose.model('ExportGuidance');

exports.save = async(function (data) {
    return await(new ExportGuidance(data).save());
});
