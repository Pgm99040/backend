const mongoose = require("mongoose");

const Iterator = mongoose.Schema({
    batchId: String,
    sessionId: String,
    date: String,
    duration: String,
    meetLink: String,
    timeZone:String,
    location: String
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Iterator', Iterator);
