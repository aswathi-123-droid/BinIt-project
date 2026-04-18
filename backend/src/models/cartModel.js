import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        selectionType: {
          type: String,
          enum: ["default", "variation", "estimation"],
          default: "default",
        },
        selectionName: String,
        image: String,
        userUploadedImages: [{ type: String }],
      },
    ],
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
