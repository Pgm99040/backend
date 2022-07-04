const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const ExportGuidanceSubscriber = mongoose.model('ExportGuidanceSubscribers');

exports.save = async(function (data) {
    return await(new ExportGuidanceSubscriber(data).save());
});
