import mongoose from "mongoose";

const connectToDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Error in connecting with database", error);
        process.exit(1)
    }
};

export default connectToDb;