const Micro_Course = require("../models/micro_course");
const Micro_Lesson = require("../models/micro_lesson");
const MicroCourseComplete = require('../models/micro_course_complete');
const MicroLessonComplete = require('../models/micro_lesson_complete');
const coursePurchased = require('../models/course_payment');
const microCourse = require("../repository/micro_course");

exports.createMicroCourse = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await microCourse.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.updateMicroCourse = async (req, res) => {
    try {
        await Micro_Course.findByIdAndUpdate({_id : req.body._id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getCourse = async (req, res) => {
    try {
        const data = await Micro_Course.find({isActive : true});
        for (const item of data) {
            let course = {...item};
            const takeCourse = await coursePurchased.find({courseId : item._id});
            if(takeCourse.length){
                course._doc.takeCourse = true
            }else {
                course._doc.takeCourse = false
            }
        }
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllCourse = async (req, res) => {
    try {
        const data = await Micro_Course.find({});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getMicroCourseDetail = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Micro_Course.find({_id : id});
        const Lesson = await Micro_Lesson.find({microCourseID : id});
        const completeCourse = await MicroCourseComplete.find({courseId : id});
        const takeCourse = await coursePurchased.find({courseId : id});
        let testData = {...data[0]};
        if(takeCourse.length){
            testData._doc.takeCourse = true
        }else {
            testData._doc.takeCourse = false
        }
        if(completeCourse.length){
            testData._doc.courseComplete = true
        }else {
            testData._doc.courseComplete = false
        }
        testData._doc.Lesson = Lesson;
        let responseData = [testData._doc];
        res.send({msg: "done", data: responseData});
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getCourseLessonDetail = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Micro_Course.find({_id : id});
        const Lesson = await Micro_Lesson.find({microCourseID : id}).select("_id lessonName lessonOrder lessonTags");
        Lesson.sort(function(a, b) {
            if (a.lessonOrder < b.lessonOrder) return -1;
            if (a.lessonOrder > b.lessonOrder) return 1;
            return 0;
        });
        for (const item of Lesson) {
            let data = {...item};
            const completeLesson = await MicroLessonComplete.find({lessonId : item._id});
            if(completeLesson.length){
                data._doc.lessonComplete = true
            }else {
                data._doc.lessonComplete = false
            }
        }
        const completeCourse = await MicroCourseComplete.find({courseId : id});
        let testData = {...data[0]};
        if(completeCourse.length){
            testData._doc.courseComplete = true
        }else {
            testData._doc.courseComplete = false
        }
        testData._doc.Lesson = Lesson;
        let responseData = [testData._doc];
        res.send({msg: "done", data: responseData});
    }catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.activeCourse = async (req, res) => {
    const id = req.params.id;
    await microCourse.active(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully Activate MicroCourse."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.deActiveCourse = async (req, res) => {
    const id = req.params.id;
    await microCourse.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate MicroCourse."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}


