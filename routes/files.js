const router = require('express').Router();
const multer = require("multer");
const path = require('path');
const File = require('../models/file');
const {v4:uuid}=require('uuid');

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'upload/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1E9
    )}${path.extname(file.originalname)}`;
    cb(null,uniqueName);
  },
});

let upload = multer({
    storage,
    limit:{filesize:1000000*100},//define 100 mb 
}).single('myfile');
router.post('/', (req, res) => {
    
  
  //Store Files
  upload(req,res,async(err)=>{
     //validate request
     if (!req.file) {
        return res.json({ error: "All Fields input are madatory" });
    }

        if(err){
            return res.status(500).send({error:err.message});
        }
    //Store into Database
        const file= new File({
                filename:req.file.filename,
                uuid: uuid(),
                path:req.file.path,
                size:req.file.size
        });
        const response = await file.save();
        return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
  });
  //Response -> Link
});

router.post('/send',async(req,res)=>{
    const {uuid, emailTo, emailFrom} = req.body;
    //validate requestt
    if(!uuid|| !emailTo || !emailFrom){
        return res.status(422).send({error:'All fields are mandatory '});
    }

    // get data from database 
    const file = await File.findOne({uuid: uuid});
    if(file.sender)
    {
        return res.status(422).send({error:'Email send Already'});
    }
    
    file.sender = emailFrom;
    file.reciver = emailTo;
    const response = await file.save();

    //send email
    const sendMail = require('../services/emailServices');
    sendMail({
        from:emailFrom,
        to:emailTo,
        subject:'let Us Share is now available 24*7',
        text:`${emailFrom} shared a file with you`,
        html:require('../services//emailTemplate')({
            emailFrom:emailFrom,
            downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size:parseInt(file.size/1000)+'KB',
            expires:'24 hours'
    })
    });
    return res.send({success:true});
});

module.exports = router;
