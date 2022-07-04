const TaskReview = require("../models/taskreviw");
const taskReview = require("../repository/taskreviewrepo");
const tasktaskreview = require("../repository/taskreviewrepo");

exports.taskEngagementtaskreview = async (req, res) => {
    try {
        console.log("hello")
        const obj = {
            ...req.body
        };
        console.log("obj",obj)
        await tasktaskreview.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.taskEngagementgettaskreview=async (req, res)=>{
    try {
        const id = req.params.id
        await tasktaskreview.gettaskReview(id).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
}

exports.taskEngagementupdatetaskreview=async (req, res)=>{
    try{
        const id = req.params.id;
        const data = req.body;
        const promiseBuilder = {
            updateAppPromise: (payload, userID) => new Promise(async (resolve) => {
                const taskReview = await TaskReview.findOneAndDelete({TaskEngagementId: userID});
                console.log("payload",payload,userID)
                const obj = {
                    TaskEngagementId: userID,
                    TaskReviewItemId: payload._id,
                    MentorTaskReviewTextForReviewItem: payload.MentorTaskReviewTextForReviewItem
                };
                const isCreated = await TaskReview.create(obj);
                console.log("isCreated",isCreated)
                if (isCreated && isCreated._id) {
                    return resolve({success: true})
                } else {
                    return resolve({success: false})
                }
            })
        };
        const allPromises = [];
        if (data && data.length > 0) {
            data.forEach(item => {
                allPromises.push(promiseBuilder.updateAppPromise(item, id))
            });
            await Promise.all(allPromises).then(values => {
                if (values.some(value => value.success)) {
                    res.status(200).send({success: true, message: "Successfully created"})
                } else {
                    res.status(400).send({success: false, message: "something went wrong"})
                }
            })
        } else {
            res.status(400).send({success: false, message: "No Data Found"})
        }
    }catch (e) {
        res.status(400).send("fail")
    }
};
