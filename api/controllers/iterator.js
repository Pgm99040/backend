require("../models/iterator");
const iterator = require("../repository/iterator");
const Iterator = require("../models/iterator");
exports.createIterator = async (req, res) =>{
    try{
        let response = {};
        const isExist = await Iterator.findOne({ $and: [ { date: req.body.date }, { batchId: req.body.batchId }, { duration: req.body.duration }, { sessionId: req.body.sessionId } ] });
        if (isExist && Object.keys(isExist).length > 0){
            response = await Iterator.findByIdAndUpdate({_id: isExist._id}, req.body);
        } else {
            response = await Iterator.create(req.body);
        }
        res.status(200).send({msg: "success", response});
    } catch (e) {
        res.status(500).send("fail")
    }
};
exports.editIterator = async (req, res) =>{
    const id = req.params.id;
    try{
        const response = await Iterator.findByIdAndUpdate({_id: id}, req.body);
        if (response){
            res.status(200).send({msg: "success", response});
        } else {
            res.status(400).send({msg: "success", response});
        }
    } catch (e) {
        res.status(500).send("fail")
    }
};

exports.getAllIterator = async (req, res) =>{
    try{
        await iterator.findAllIterator().then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(500).send("fail")
    }
};

exports.getIteratorByBatch = async (req, res) =>{
    const id = req.params.batchId;
    try{
        await iterator.findIteratorByBatchId(id).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(500).send("fail")
    }
};
exports.removeIterator = async (req, res) =>{
    const id = req.params.id;
    try{
        await iterator.removeIterator(id).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(500).send("fail")
    }
};
