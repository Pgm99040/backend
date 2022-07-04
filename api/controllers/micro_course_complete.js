const microCourseComplete = require("../repository/micro_course_complete");

exports.courseCompleteStatus = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await microCourseComplete.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};
