import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide valid email address"],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    googleId: {
      type: String,
    },
    phone: {
      type: String,
      default: null,
    },
    avatar: { 
      type: String, 
      default: "uploads/default-avatar.png" 
    },

    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    isBlocked: { 
      type: Boolean,
      default: false 
    },
    refreshToken: [{
      type: String
    }],
    // referralCode: {
    //   type: String,
    //   unique: true,
    //   index: true,
    // },
    // referrerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
    // referredUsers: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // referralBonus: {
    //   type: Number,
    //   default: 0,
    // },
    // referralBonus: {
    //   type: Number,
    //   default: 0,
    // },
    // referralRewards: {
    //   count: { type: Number, default: 0 },
    //   amount: { type: Number, default: 0 },
    // },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $ne: null } } });

//asw
// userSchema.pre('save', async function() {
//   if (!this.isModified('password')) {
//     return ;
//   }

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);

// });

// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model("User", userSchema);

export default User;
