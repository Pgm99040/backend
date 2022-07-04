const coursePayment = require("../models/course_payment");
const Course_Payment = require("../repository/course_payment");

exports.requestForCourse = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await Course_Payment.save(obj).then(response => {
            res.json({ status_code: 200, success: true, result: response, message: 'success.' })
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};
