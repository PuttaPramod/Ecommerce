import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Address' },
    firstName: { type: String, required: true }, lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true }, phone: { type: String, required: true },
    address: { type: String, required: true }, city: { type: String, required: true },
    state: { type: String, required: true }, zip: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const userDetailsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        match:/^\d{10}$/,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:8
    },
    addresses: { type: [addressSchema], default: [] }
},{timestamps:true});

const User=mongoose.model("UserModel",userDetailsSchema)
export default User;
