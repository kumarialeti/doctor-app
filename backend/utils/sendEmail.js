import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    // Use Gmail SMTP (or another real email provider)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER, // Will pull from .env file
        pass: process.env.SMTP_PASS, // Will pull from .env file
      },
    });

    const mailOptions = {
      from: '"MediCarePro Platform" <noreply@medicarepro.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
