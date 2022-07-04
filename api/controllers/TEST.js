const testmodal = require('../models/TEST');
const TEST = require("../repository/TEST");

exports.getAllTest=(req, res)=>{
    TEST.getTest().then(response =>{
            if (response){
                res.status(200).send(response);
            } else {
                res.status(400);
            }
        }).catch(err =>{
            console.log("error", err);
        });
}

exports.postTest = async (req, res) => {
    try {
        console.log("hello")
        const obj = {
            ...req.body
        };
        console.log("obj",obj)
        await TEST.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getRendomTest=(req, res)=>{
    console.log("req.body",req.params.testId)
    TEST.getEachTest({TestId:req.params.testId}).then(response =>{
        if (response){
            res.status(200).send(response);
        } else {
            res.status(400);
        }
    }).catch(err =>{
        console.log("error", err);
    });
}

exports.postMcqQuestion = async (req, res) => {
    try {
        console.log("hello",req.body)
        testmodal.findOneAndUpdate({TestId:req.params.testId},{MultipleChoiceQuestion:req.body}).then(response =>{
            if (response){
                res.status(200).send(response);
            } else {
                res.status(400);
            }
        }).catch(err =>{
            console.log("error", err);
        });
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getMCQtest=async (req, res)=>{
    console.log("")
    TEST.getTest().then(response =>{
        if (response){
            res.status(200).send(response);
        } else {
            res.status(400);
        }
    }).catch(err =>{
        console.log("error", err);
    });
}

exports.getSelectMCQtest=async (req, res)=>{
    TEST.getEachTest({TestId:req.params.testId}).then(response =>{
        if (response){
            res.status(200).send(response);
        } else {
            res.status(400);
        }
    }).catch(err =>{
        console.log("error", err);
    });
}

exports.getSelectDeleteMCQtest=async (req,res)=>{
    try {
        const deletetest=await  testmodal.findByIdAndDelete({_id:req.params.testId}).then(response =>{
            if (response){
                res.status(200).send(response);
            } else {
                res.status(400);
            }
        }).catch(err =>{
            console.log("error", err);
        });
    }catch (e) {
        console.log("error", err);

    }

}









