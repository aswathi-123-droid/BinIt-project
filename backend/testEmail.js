import { sendEmail } from "./src/utils/email.js";


const test = async () => {
  try {
    await sendEmail({
      to: "aswathiaswaa3@gmail.com",
      subject: "Test email from Node",
      html: "<h2>🚀 It works!</h2>",
    });

    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Email failed:", err);
  }
};

test();
