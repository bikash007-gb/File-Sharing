const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const File = require('../model/File')
const{v4:uuid4} = require('uuid')

let storage = multer.diskStorage({
    destination:(req,file,callback) =>callback(null,'uploads/'),
    filename:(req,file,callback)=>{
        const uniqueName =`${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`
        callback(null,uniqueName)
    }
})

let upload = multer({
    storage: storage,
    limit:{fileSize:1000000*100}//100mb
}).single('myfile')

router.get('/',(req,res)=>{
    res.render('index')
})

router.post('/', (req,res) => {
    
    //Store files
    upload(req,res,async (err)=>{
        //Validate the request
        if(err){
            res.status(500).send({error:err.message })
        }
        //store into database
        const file = new File({
            filename:req.file.filename,
            uuid:uuid4(),
            path:req.file.path,
            size:req.file.size
        })
        try {
            const response = await file.save()
            return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`})
        } catch (error) {
            console.log(error.message)
            res.json({error:"something wrong"})
        }
        
    })
    

    //Response
})
router.post('/send',async (req, res)=>{
    const { uuid, emailTo, emailFrom } = req.body;
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required except expiry.'});
  }
  const file = await File.findOne({ uuid:uuid})
  if(file.sender){
    return res.status(422).send({ error: 'Email already sent'});
  }
  file.sender = emailFrom
  file.receiver=emailTo
  const response  = await file.save()

  //send mail
  const sendMail = require('../service/emailService')
  sendMail({
      from:emailFrom,
      to:emailTo,
      subject:'FileShare file sharing',
      text:`${emailFrom} share a file with you`,
      html:require('../service/emailTemplate')({
        emailFrom, 
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
        size: parseInt(file.size/1000) + ' KB',
        expires: '24 hours'
    })
        }).then(() => {
        return res.json({success: true});
        }).catch(err => {
            console.log(err)
        return res.status(500).json({error: 'Error in email sending.'});
        });
})
module.exports =router