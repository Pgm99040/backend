const TestSelectAns = require('../models/TestSelectAns');
const TestSelectAnsRepo = require("../repository/TestSelectAns");

exports.createTestSelectAns = async (req, res) => {
    try {
        const findAns=await TestSelectAns.find({testId:req.body.testId})
        console.log('findAns',findAns.length);

        if(findAns.length > 0){
            await TestSelectAnsRepo.UpdateSelectAns(req.body.testId,req.body).then(response => {
                res.status(200).send({msg: "success", response});
            }).catch(err => {
                console.log("error----->>", err);
                res.status(404).send({msg: "error"});
            })
        }else {
            await TestSelectAnsRepo.addTestSelectAns(req.body).then(response => {
                res.status(200).send({msg: "success", response});
            }).catch(err => {
                console.log("error----->>", err);
                res.status(404).send({msg: "error"});
            })
        }
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getAllTestSelectAns = async (req, res) => {
    try {
        const data = await TestSelectAnsRepo.getTestSelectAns().populate({path: 'subCategory'}).populate({path: 'category'}).sort ({createdAt : -1});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAnsTest=async (req, res)=>{
    try {
        const findAns=await TestSelectAns.find({testId:req.params.testId});
        res.send({msg: "done", findAns})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
}