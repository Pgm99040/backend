const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');
const BookSession = require("../models/book_session");

exports.save = async(function (data) {
    return await(new BookSession(data).save());
});