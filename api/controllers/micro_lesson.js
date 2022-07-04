const Micro_Lesson = require("../models/micro_lesson");
const MicroLessonComplete = require('../models/micro_lesson_complete');
const microLesson = require("../repository/micro_lesson");

exports.createMicroLesson = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await microLesson.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getLessons = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Micro_Lesson.find({microCourseID : id});
        res.send({msg: "success", data: data})
    } catch (e) {
        res.status(400).send({msg: "fail", e})
    }
};

exports.getLessonContent = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Micro_Lesson.find({_id : id});
        const completeLesson = await MicroLessonComplete.find({lessonId : id});
        let testData = {...data[0]};
        if(completeLesson.length){
            testData._doc.lessonComplete = true
        }else {
            testData._doc.lessonComplete = false
        }
        let responseData = [testData._doc];
        res.send({msg: "success", data: responseData})
    } catch (e) {
        res.status(400).send({msg: "fail", e})
    }
};

exports.updateLesson = async (req, res) => {
    try {
        await Micro_Lesson.findByIdAndUpdate({_id : req.body.id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};
