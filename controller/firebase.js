const User = require("../models/user");

exports.createOrUpdateUser = async (req, res) => {
  const { name, pic, email, password, address, gender } = req.body;

  const user = await User.findOneAndUpdate(
    { email },
    { username: email.split("@")[0], pic, name, password, address, gender },
    { new: true }
  );

  if (user) {
    res.json(user);
  } else {
    const newUser = await new User({
      email,
      username: email.split("@")[0],
      pic,
      name,
      password,
      address,
      gender,
    }).save();
    res.json(newUser);
  }
};

exports.currentUser = async (req, res) => {
  await User.findOne({ email: req.user.email }).exec((err, user) => {
    if (err) throw new Error(err);
    res.json(user);
  });
};
