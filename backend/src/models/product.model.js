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
        hasVariations: {
            type: Boolean,
            default: false
        },
        variations: [{
            name: { type: String, required: true }, // e.g., "3-Seater", "King Size"
            price: { type: Number, required: true },
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true } // Auto-generate ID for cart logic
        }],
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

    if (this.hasVariations && this.variations && this.variations.length > 0) {
        const lowestPrice = Math.min(...this.variations.map(v => v.price));
        this.price = lowestPrice;
    }
})

const Product = mongoose.model("Product",productSchema);

export default Product;