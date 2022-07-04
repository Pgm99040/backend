const mongoose = require("mongoose");

const ExportGuidance = mongoose.Schema({
    exportGuidanceTitle : String,
    exportGuidanceDescription : String,
    exportGuidanceImageUrl  : String,
    isActive : { type : Boolean,
        default: false}
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('ExportGuidance', ExportGuidance);
