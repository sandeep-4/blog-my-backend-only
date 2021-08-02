const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  var transporter = nodemailer.createTransport({
    // host: "smtp.mailtrap.io",
    // port: 2525,
    service: "gmail",
    auth: {
      user: "springboottest123@gmail.com",
      pass: "spring@123",
    },
  });
  const message = {
    from: "no_reply@leora.com",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  await transporter.sendMail(message, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log("sent email");
    }
  });
};

module.exports = sendEmail;
