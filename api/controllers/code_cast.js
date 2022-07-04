const CodeCast = require('../models/code_cast');
const codeCast = require("../repository/code_cast");

exports.createCodeCast = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await codeCast.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getAllCodeCast = async (req, res) => {
    try {
        const data = await CodeCast.find({}).populate({path: 'subCategory'}).populate({path: 'category'}).sort ({createdAt : -1});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.updateCodeCast = async (req, res) => {
    try {
       const respons= await CodeCast.findByIdAndUpdate({_id : req.body._id}, req.body);
       if(respons) {
           res.send({msg: "done", success: true})
       }
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.activeCodeCast = async (req, res) => {
    const id = req.params.id;
    await codeCast.active(id).then(response=>{
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

exports.deActiveCodeCast = async (req, res) => {
    const id = req.params.id;
    await codeCast.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate Blog."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.getCodeCast=async  (req, res)=>{
    try {
        const data = await CodeCast.find({isActive : true}).populate({path: 'subCategory'}).populate({path: 'category'}).sort ({createdAt : -1});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
}
