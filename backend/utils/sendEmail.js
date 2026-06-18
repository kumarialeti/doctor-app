import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn("⚠️ SMTP credentials are not defined in .env. Skipping email sending.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"MediCarePro Platform" <${user}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message.replace(/\n/g, "<br>")}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully via Nodemailer. ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email via Nodemailer:", error);
  }
};

export default sendEmail;
