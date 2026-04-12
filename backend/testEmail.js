import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("Testing connection...");
    await transporter.verify();
    console.log("✅ Credentials are perfectly valid and Google allows the connection!");
    
    // We send a test email
    const info = await transporter.sendMail({
      from: '"Test Sender" <' + process.env.SMTP_USER + '>',
      to: process.env.SMTP_USER,
      subject: "Test Google App Password",
      text: "This is a test verifying your email works."
    });
    
    console.log("✅ Email sent! Message ID: " + info.messageId);
    process.exit(0);
  } catch (err) {
    console.error("❌ Google App Password failed:", err.message);
    process.exit(1);
  }
};

testEmail();
