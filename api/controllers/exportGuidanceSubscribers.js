const ExportGuidanceSubscribers = require("../models/exportGuidanceSubscribers");
const exportGuidanceSubscribers = require("../repository/exportGuidanceSubscribers");

exports.addExportGuidanceSubscriber = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        console.log("obj",obj)
        const alreadyExist = await ExportGuidanceSubscribers.find({exportGuidanceId: obj.exportGuidanceId});
        if(alreadyExist.length > 0){
            return res.status(200).send({msg: "Already Exist!", status: false});
        }
        await exportGuidanceSubscribers.save(obj).then(response => {
            res.status(200).send({msg: "success", response, status: true});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error", status: false});
        })
    } catch (e) {
        res.status(400).send({msg:"fail", status: false})
    }
};

exports.getAllExportGuidanceSubscriber = async (req, res) => {
    try {
        const data = await ExportGuidanceSubscribers.find({}).populate({path: 'exportGuidanceId'});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};
