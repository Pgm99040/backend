const mongoose = require("mongoose");

const Feed = mongoose.Schema({
    feedTitle : String,
    feedContentSummary : String,
    feedImageUrl : String,
    feedLinkUrl : String,
    feedId : String,
    isActive : { type : Boolean,
        default: false}
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Feed', Feed);
