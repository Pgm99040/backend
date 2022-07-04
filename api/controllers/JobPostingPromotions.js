const JobPostingPromotions = require("../repository/JobPostingPromotions");
const Job_Posting_Promotions = require("../models/JobPostingPromotions");
const User = require("../models/user")


exports.createJobPostingPromotions = async (req, res) => {
    try {

       const jobFind= await Job_Posting_Promotions.find({Useremail:req.body.Useremail,JobPostingId:req.body.JobPostingId})
        console.log('jobFind',jobFind)
        if(jobFind.length>0){ return res.status(404).send({msg: "already promoted"}) }
        await JobPostingPromotions.save(req.body).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getJobpostpromotion=async(req, res)=>{
    try {
        const data = await Job_Posting_Promotions.find({}).populate({path:'JobPostingId',populate:{path:'taskRequire',populate:[{path:'taskCategory'},{path:'taskSubCategory'}]}});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
}

exports.getJobpostpromotionUser=async (req,res)=>{
    try {
        const data = await User.find({email:req.body.email});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
}