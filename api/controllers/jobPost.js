const JobPost = require("../repository/jobPost");
const Job_Post = require("../models/jobPost");
const task_engagement = require("../models/taskengagement")

exports.createJobPost = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await JobPost.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.updateJobPost = async (req, res) => {
    try {
        await Job_Post.findByIdAndUpdate({_id : req.body._id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllJobPost = async (req, res) => {
    try {
        const data = await Job_Post.find({})
            .populate({path: 'taskRequire', populate: [{ path: 'taskCategory' }, { path: 'taskSubCategory' }]});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getJobPost = async (req, res) => {
    try {
        const data = await Job_Post.find({isActive : true})
            .populate({path: 'taskRequire', populate: [{ path: 'taskCategory' }, { path: 'taskSubCategory' }]});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.activeJobPost = async (req, res) => {
    const id = req.params.id;
    await JobPost.active(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully Activate Blog."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.deActiveJobPost = async (req, res) => {
    const id = req.params.id;
    await JobPost.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate Blog."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
};

exports.userEligibleForJobPostingPromotion = async (req, res) => {
    try{
        const jobPostId = req.params.id;
        const data = req.user;
        const jobPost = await Job_Post.findOne({_id : jobPostId});
        const taskEngage = await task_engagement.find({user: data._id}).populate({path: 'task'});
        const eligible = Array.isArray(jobPost.taskRequire) && jobPost.taskRequire.map(item =>
            taskEngage.filter(eachItem => item.taskCategory.toString() === eachItem.task.category.toString()
                && item.taskSubCategory.toString() === eachItem.task.subcategory.toString()).length >= item.numOfTask
        ).every(e => e === true);
        res.status(200).send({msg: "job Promote", data: eligible});
    }catch (e) {
        res.status(500).send({msg: "internal server error."});
    }
};
