import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true,"Category name is required"],
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            enum: {
                values: ["recyclable", "junk", "store"],
                message: "{VALUE} is not a supported category type",
            },
            required : [true,"Category type (recyclable/junk) is required"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        offer: {
            isActive: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                trim: true
            },
            description: {
                type: String,
            },
            discountType: {
                type: String,
                enum: ["flat", "percent"],
            },
            value: {
                type: Number,
                min: [0,"Discount value cannot be negative"]
            },
            minTransactionalValue: {
                type: Number,
                default: 0
            },
            maxRedeemableAmount: {
                type: Number,
                default: 0,
            },
            startDate: {
                type: Date
            },
            expiryDate: {
                type: Date
            },
        }
    },
    {
        timestamps : true
    }
)

categorySchema.pre("save",function(){
    if(this.isModified("name") && !this.slug){
        this.slug = this.name.toLowerCase().split(" ").join("-");
    }
});

const Category = mongoose.model("Category",categorySchema);

export default Category;