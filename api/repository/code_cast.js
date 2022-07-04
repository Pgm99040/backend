const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const CodeCast = mongoose.model('code_cast');

exports.save = async(function (data) {
    return await(new CodeCast(data).save());
});

exports.active = async (function (id) {
    return await(CodeCast.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(CodeCast.findByIdAndUpdate({_id: id}, {isActive : false}));
})
