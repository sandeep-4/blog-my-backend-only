const User = require("../models/user");
const catchAsyncError = require("./cathcAsyncError");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const cathcAsyncError = require("./cathcAsyncError");

exports.isAuthenticated = cathcAsyncError(async (req, res, next) => {
  const { authtoken } = req.cookies;
  console.log(authtoken);
  if (!authtoken) {
    return next(new ErrorHandler("Please Login", 400));
  }
  const decoded = jwt.verify(authtoken, process.env.JWT_SECRET);
  req.user = await User.findOne(decoded.id);
  next();
});

exports.isAdmin = catchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).exec();
    if (!user.role.includes("admin")) {
      return res.status(402).json({
        err: "Acess denided",
      });
    } else {
      next();
    }
  } catch (error) {
    cosole.log(error);
  }
});
