const mongoose = require("mongoose");

const InstructorRating = mongoose.Schema({
    rating_date: {type: String, require: true},
    rating_user: {type: String, require: true},
    rating_stars: {type: Number, require: false, default: 0},
    rating_comments: { type: String, require: false },
    user: String,
    livesession: String
    // livesession: {type: mongoose.Schema.Types.ObjectId, ref: "LiveSession"}
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('InstructorRating', InstructorRating);
