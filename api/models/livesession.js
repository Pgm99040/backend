const mongoose = require("mongoose");

const LiveSession = mongoose.Schema({
    title: String,
    description: String,
    Outcomes: String,
    LanguageOfInstruction: String,
    // instructorName: String,
    // instructorId: String,
    seats: {type: Number},
    batches: [{capacityOfSeats: Number, batchUrlName: String, batchDescription : String, instructorId: String, batchIsFull: {type: Boolean, default: false}}],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price : String,
    currencyCode : String,
    slug : String,
    sessionLocation: String,
    timeZone: String,
    isActive : { type : Boolean},
    Thumbnail_ImageURL : {type : String},
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    subCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
    // rating: {type: mongoose.Schema.Types.ObjectId, ref: "instructor_rating"},
    // liveSessionReview: {type: mongoose.Schema.Types.ObjectId, ref: "LiveSessionReview"},
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('LiveSession', LiveSession);
