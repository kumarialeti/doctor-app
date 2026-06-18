
const sendEmail = async (options) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ RESEND_API_KEY is not defined in .env. Skipping email sending.");
      return;
    }

    const fromEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `MediCarePro <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message.replace(/\n/g, "<br>")}</p>`,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Email sent successfully via Resend. ID:", data.id);
    } else {
      console.error("❌ Resend API Error:", data);
    }
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error);
  }
};

export default sendEmail;
