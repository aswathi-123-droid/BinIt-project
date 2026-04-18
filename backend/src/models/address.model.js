import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId :{
           type : mongoose.Schema.Types.ObjectId,
           ref:"User",
           required:true,
        },
        type:{
            type : String,
            enum : ['Home', 'Work', 'Other'],
            required: [true, "Address type (type) is required"],
            default: 'Home'
        },
        name:{
            type : String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        phone:{
            type : String,
            required: [true, "Phone number is required"],
            match: [
                /^(?:\+91)?[6-9]\d{9}$/,
                "Phone number must be a valid 10-digit Indian number, optionally starting with +91",
            ],
        },
        flat: {
            type: String,
            required: [true, "Flat / House No. is required"],
            trim: true,
        },
        street: {
            type: String,
            required: [true, "Building / Street name is required"],
            trim: true,
        },
        locality: {
            type: String,
            required: [true, "Locality / Area is required"],
            trim: true,
        },
        city:{
            type: String,
            required: [true, "City is required"],
            minlength: [2, "City must be at least 2 characters"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
            minlength: [2, "State must be at least 2 characters"],
        },
        pincode: {
            type: String,
            required: [true, "Pin code is required"],
            match: [/^\d{6}$/, "Pin code must be exactly 6 digits"],
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        },
    },
    {timestamps: true}
);

addressSchema.index({ userId: 1 });

const Address = mongoose.model("Address",addressSchema);

export default Address;