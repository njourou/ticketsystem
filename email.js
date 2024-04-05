require('dotenv').config();
const nodemailer = require('nodemailer');
async function sendEmail(userEmail, subject, text, attachment) {
    try {
        // Create a transporter
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `"TIKITI" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: subject,
            text: text,
            attachments: [{
                filename: 'ticket_confirmation.pdf',
                content: attachment
            }]
        });

        console.log("Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = { sendEmail };