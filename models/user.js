const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    address: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
        default: "ayasysdyftft/sjhbjhbj",
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dmctlr8gx/image/upload/v1614693543/download_dasjmw.jpg",
      },
    },
    resetToken: String,
    expireToken: Date,
    followers: [
      {
        type: String,
        ref: "User",
      },
    ],
    following: [
      {
        type: String,
        ref: "User",
      },
    ],
    ratings: [
      {
        star: Number,
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
    //user can save this post the look later
    savePost: [
      {
        type: ObjectId,
        ref: "Post",
      },
    ],
  },

  { timestamps: true }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digeset("hex");
  this.resetPasswordDate = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
