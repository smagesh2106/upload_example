const mailer = require("nodemailer");
const SibApiV3Sdk = require('sib-api-v3-typescript');
const { SENDINBLUE_APIKEY } = process.env
const sendMail = (resetLink, email, cb) => {
  let transporter = mailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.APP_EMAIL_USER,
      pass: process.env.APP_EMAIL_PASSWD,
    },
  });

  let mailOptions = {
    from: process.env.APP_EMAIL_USER,
    to: email,
    subject: "Node password reset link",
    text: resetLink,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      cb(error);
    } else {
      cb(null);
    }
  });
};

const sendMailViaBrevo = (sendSmtpEmail) => {
  try {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.AccountApiApiKeys.apiKey, SENDINBLUE_APIKEY);
    return apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
      return data
    }, function (error) {
      console.error(error);
      return false;
    });

  } catch (error) {
    return error
  }
};

module.exports = {
  sendMail,
  sendMailViaBrevo
};
