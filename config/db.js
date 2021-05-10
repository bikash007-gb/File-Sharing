const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

function connectDB(){
    const DB = process.env.DATABASE.replace('<password>', process.env.DB_PW);

    mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful!')).catch(err => console.log('failed to connect'))
}

module.exports = connectDB