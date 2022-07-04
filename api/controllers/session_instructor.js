const Instructor = require("../models/session_instructor");

exports.getInstructor = async (req, res) =>{
    try{
        const instructor = await Instructor.find({})
        res.send({msg : "done", instructor})

    }catch(e){
        res.status(400).send({msg : "err"})
    }
}

exports.addInstructor = async (req,res) => {
    try{
        console.log("req.body=================================", req.body)
        var data = new Instructor(req.body)
        await data.save(req.body).then(response=>{
            res.status(200).send({msg: "success", response});})
    }catch(e){
        res.status(400).send({msg : "err"})

    }
}

