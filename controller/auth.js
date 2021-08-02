const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

exports.createUser = async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      width: 150,
      crop: "scale",
    });

    const { name, email, password, gender, address } = req.body;
    if (!name && !email && !gender) {
      return res.status(401).send("Fill form carefully");
    }
    if (!password || password.length < 8) {
      return res.status(401).send("Password must be 8 or more chars");
    }
    let existingUser = await User.findOne({ email }).exec();
    if (existingUser) return res.status(401).send("Email is taken");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      username: email.split("@")[0],
      password: hashedPassword,
      gender,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      address,
    });
    await user.save().then((user) => {
      sendEmail({
        email: email,
        subject: "New user created",
        message: "<h2>Welcome to Leroa</h2>",
      });
    });
    console.log("email sent");
    return res.json({
      user,
      ok: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send("Enter Credintials! try again " + error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    console.log(user.password);
    console.log(password);
    if (!user) return res.status(401).send("Invalid User");
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("Invalid credintials");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    //you can destructure user here and send
    res.cookie("authtoken", token, { httpOnly: true });
    res.json({
      user,
      token: "Bearer " + token,
    });
  } catch (error) {
    return res.status(400).send("Error Login");
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(401).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .select("-password")
      .exec();
    res.json({ ok: true, user });
  } catch (error) {
    console.log(error);
  }
};

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id })
    .select("+password")
    .exec();
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return res.json({ message: "Invalid credintials" });
  }
  user.password = req.body.password;
  await user.save();
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  //avatar
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    width: 150,
    crop: "scale",
  });
  //user input
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    username: email.split("@")[0],

    //avatar
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  };
  const check = await User.findById(req.user._id);
  if (!check) {
    return next(ErrorHandler("No such user", 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).send("Invalid credintials");
  }
  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //create url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/password/reset/${resetToken}`;

  console.log(resetUrl);
  const message = `Please click one time url to change Password ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password change token Lora",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent ${resetUrl}`,
    });
  } catch (error) {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Opps something went wrong", 400));
  }
};

exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({ resetPasswordToken });
  if (!user) {
    return res.status(400).send("Unable to reset");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).send("password doesnt match");
  }
  user.password = req.body.password;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: "Ipdated sucessfully" });
};

//only for admins
exports.getAllUSers = async (req, res) => {
  const users = await User.find({}).exec();
  if (!users) {
    return res.status(400).send("No users found");
  }
  res.status(200).json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res.status(400).send("No users found");
  }
  res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    username: email.split("@")[0],
  };
  const check = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });
  if (!check) {
    return res.status(400).send("No users updated");
  }
  res.status(200).json({
    success: true,
  });
};

exports.deleteUser = async (req, res) => {
  //clodainary removal
  // let image_id = req.body.public_id;
  // cloudinary.uploader.destroy(image_id, (err, result) => {
  //   if (err) return res.json({ success: false, err });
  //   res.send("deleted");
  // });
  //dbremoval
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res.status(400).send("No users found");
  }
  await user.remove();
  res.status(200).json({
    success: true,
  });
};

//follow and unfollow features
exports.follow = async (req, res) => {
  //add folloer on given id
  await User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    async (err, result) => {
      if (err) {
        res.json({ msg: "Error following" });
      }
      //add folloer in ones own following list
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  );
};

exports.unfollow = async (req, res) => {
  await User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    async (err, result) => {
      if (err) {
        res.json({ msg: "Error unfollowing" });
      }
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }
      )
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          res.json(error);
        });
    }
  );
};

//userreview

exports.userStar = async (req, res) => {
  try {
    const ratedUser = await User.findById(req.params.id);
    const ratingUser = await User.findOne({ email: req.user.email }).exec();
    const { star } = req.body;
    //if current user already rated
    let existingRating = ratingUser.ratings.find(
      (ele) => ele.postedBy.toString() === user._id.toString()
    );
    if (existingRating === undefined) {
      let ratingAdded = await User.findByIdAndUpdate(
        ratedUser._id,
        {
          $push: {
            ratings: {
              star,
              postedBy: ratingUser._id,
            },
          },
        },
        { new: true }
      ).exec();
      res.json(ratingAdded);
    } else {
      const ratingUpdated = await User.updateOne(
        {
          ratings: { $elemMatch: existingRating },
        },
        { $set: { "ratings.$.star": star } },
        { new: true }
      ).exec();
      res.json(ratingUpdated);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.searchUser = async (req, res) => {
  let userPattern = new RegExp("^" + req.body.query);
  await User.find({ email: { $regex: userPattern } })
    .select("_id name")
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.json({ msg: "No user found" });
    });
};
