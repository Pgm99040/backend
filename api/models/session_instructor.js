const mongoose = require("mongoose");

const Instructor = mongoose.Schema({
    name: String,
    bio: String,
    rating: Number,
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Instructor', Instructor);
