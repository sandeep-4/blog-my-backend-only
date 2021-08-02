const User = require("../models/user");
const admin = require("../firebase");

exports.authCheck = async (req, res, next) => {
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authToken);
    req.user = firebaseUser;
    next();
  } catch (error) {
    res.status(401).json({
      err: "Invalid credintials",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email }).exec();
  if (adminUser.role === "admin") {
    next();
  } else {
    res.status(403).json({
      err: "Access denied",
    });
  }
};
