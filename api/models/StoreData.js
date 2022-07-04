const mongoose = require("mongoose");

const StoreData = mongoose.Schema({
    title: {type: String},
    subtitle: {type: String},
    discription: {type: String},
    image: { type: String},
    location:{ type: String},
    type:{type: String},
    name:{type: String},
    status:{type: String},
    review:{type: String}
    // livesession: {type: mongoose.Schema.Types.ObjectId, ref: "LiveSession"}
},{
    timestamps: true
});
module.exports = mongoose.model('storedata', StoreData);