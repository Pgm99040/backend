const microLessonComplete = require("../repository/micro_lesson_complete");

exports.LessonCompleteStatus = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await microLessonComplete.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};
