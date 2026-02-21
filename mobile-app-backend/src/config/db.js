const mongoose=require("mongoose");

const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected Sucessfully");
    }catch(error){
         console.error("failed to connect",error.message);
         process.exit(1);
    }
};

module.exports = connectDB;