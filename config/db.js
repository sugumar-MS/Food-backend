import mongoose from "mongoose";

 export const  connectDB = async () => {
    await mongoose.connect('mongodb+srv://msugumar832:sugumar1607@cluster0.ehhxmli.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}