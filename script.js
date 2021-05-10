const connectDB = require('./config/db')
const File = require('./model/File')
const fs = require('fs')
connectDB()

async function fetchData(){
    const pastDate = Date.now()
    const files = await File.findOne({createdAt:{$lt: new Date(Date.now() - 24 * 60 * 60 * 1000)}})
    if(files){
        for(const file of files){
        try {
                fs.unlinkSync(file.path)
                await file.remove()
                console.log(`successfully deleted ${file.filename}`)
            }
        catch (err) {
            console.log(`error while deleting file ${err} `);
        }
       
    }
    console.log('Job done!');
}}
fetchData().then(process.exit)