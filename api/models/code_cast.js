const mongoose = require("mongoose");

const CodeCast = mongoose.Schema({
    codeCastTitle: String,
    codeCastImage: String,
    codeCastFlipPageContent: String,
    mediaEmbed: String,
    codeCastLevel: String,
    discription:String,
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    subCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
    isActive : { type : Boolean,
        default: false}
},{
    timestamps: true,
    usePushEach: true
});

module.exports = mongoose.model('code_cast', CodeCast);
