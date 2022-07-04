const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coursePaymentSchema = new Schema({
    transactionId  : { type: String, required: false, default: null },
    paymentToken  : { type: String, required: false, default: null },
    paymentGateway: { type: String, required: false, lowercase: true, default: null},
    payerId  : { type: String, required: false, default: null },
    courseId  : { type: String, required: false, default: null },
    courseName  : { type: String, required: false, default: null },
    coursePrice  : { type: Number, required: false, default: null },
    captured    : { type: Boolean, required: false, default: false},
    paymentStatus: { type: String, required: true, lowercase: true, default: 'pending', enum: ['success', 'failure', 'pending'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true
});

module.exports = mongoose.model('course_Payment', coursePaymentSchema);
