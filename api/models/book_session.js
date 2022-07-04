const mongoose = require("mongoose");

const BookSessioon = mongoose.Schema({
    LiveSessionId: {type: String, ref: "LiveSession"},
    BatchId: String,
    username: String,
    email: String,
    bookingTransactionId: String,
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('BookSessioon', BookSessioon);