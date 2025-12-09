const mongoose = require('mongoose');

const db =async ()=>{
    if(!process.env.MONGO_URI){
        console.error('MONGO_URI is not set');
        process.exit(1);
    }
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database");
    }catch(e){
        console.error("Cannot connect to database",e.message);
        process.exit(1);
    }
};
module.exports = db;