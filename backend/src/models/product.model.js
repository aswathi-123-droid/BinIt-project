import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true,"Product must belong to a category"],
            index: true
        },
        name: {
            type: String,
            required: [true,"Product name is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: ["recyclable", "junk", "store"],
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        slug: {
            type: String,
            lowercase: true,
            trim: true,
        },
        image: {
            type: [String], 
            default: [],
        },
        price: {
            type: Number,
            required: [true,"Price/rate is required"],
            min: [0,"Price cannot be negative"]
        },
        unit: {
            type: String,
            required: [true,"Unit is required"],
            enum: {
                values: ["kg","unit","bag"],
                message: "{VALUE} is not a valid pricing unit",
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEstimationEnabled: {
            type: Boolean,
            default: false
        },
        stock: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.pre("save",function() {
    if(this.isModified("name") && !this.slug) {
        this.slug = this.name.toLowerCase().split(" ").join("-");
    }
})

const Product = mongoose.model("Product",productSchema);

export default Product;