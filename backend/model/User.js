import mongoose from "mongoose";

const userDetailsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:Number,
        required:true,
        minLength:10,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:8
    }
},{timestamps:true});

const User=mongoose.model("UserModel",userDetailsSchema)
export default User;