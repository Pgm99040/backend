const mongoose = require("mongoose");

const ExportGuidanceSubscribers = mongoose.Schema({
    userId : String,
    userEmail: String,
    exportGuidanceId : {type: mongoose.Schema.Types.ObjectId, ref: "ExportGuidance"},
    registerDate: String,
    isActive : { type : Boolean,
        default: false}
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('ExportGuidanceSubscribers', ExportGuidanceSubscribers);
