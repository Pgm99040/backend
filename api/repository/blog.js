const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

// Required models ====================================
const Blog = mongoose.model('blog');

exports.save = async(function (data) {
    return await(new Blog(data).save());
});

exports.active = async (function (id) {
    return await(Blog.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(Blog.findByIdAndUpdate({_id: id}, {isActive : false}));
})
