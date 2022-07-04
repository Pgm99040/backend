const mongoose = require("mongoose");

const Blog = mongoose.Schema({
    blogTitle : String,
    blogTitleForURL : String,
    blogContent : String,
    blogTags : String,
    relevantCareerPath : String,
    blogDescription : String,
    comments : [{
        name : String,
        message : String
    }],
    embedMediaLink:String,
    isActive : { type : Boolean,
        default: false}
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('blog', Blog);
