const router = require('express').Router()
const File = require('../model/File')

router.get('/:uuid',async (req, res) => {
    try {
        const file = await File.findOne({uuid:req.params.uuid})
    if(!file){
        res.render('download',{error: 'link expired'})
    }
    const filePath =`${__dirname}/../${file.path}`
    res.download(filePath)
    } catch (error) {
        return res.render('download',{error: 'something went wrong'})
    }
    
})

module.exports = router