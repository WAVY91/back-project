const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

console.log('Testing email configuration...');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASS:', EMAIL_PASS ? '✓ Set (hidden)' : '✗ Not set');
console.log('ADMIN_EMAIL:', ADMIN_EMAIL);
console.log('');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP Connection Error:');
        console.log(error);
        console.log('');
        console.log('Solutions:');
        console.log('1. Check if Gmail app password is correct');
        console.log('2. Ensure 2FA is enabled on Gmail account');
        console.log('3. Generate a new app password from Google Account');
        console.log('4. Check EMAIL_USER and EMAIL_PASS in .env file');
    } else {
        console.log('✅ SMTP Connection Successful!');
        
        // Send test email
        const mailOptions = {
            from: EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: 'Test Email - Good Heart Charity',
            html: '<h2>Test Email</h2><p>If you received this, email service is working correctly!</p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('❌ Email Sending Failed:');
                console.log(error);
            } else {
                console.log('✅ Test Email Sent Successfully!');
                console.log('Response:', info.response);
                console.log('');
                console.log('Your email service is working! Check your inbox at:', ADMIN_EMAIL);
            }
            process.exit(0);
        });
    }
});
