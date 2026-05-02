const nodemailer = require('nodemailer');

// Create SMTP transporter (using Brevo/Sendinblue free tier)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send email
const sendEmail = async ({ email, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject,
      html,
      text
    };

    // Handle development/testing mode
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', { to: email, subject });
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Don't throw error - continue operation even if email fails
    return null;
  }
};

// Send OTP
const sendOTP = async (phone, otp) => {
  try {
    // Using MSG91 API for India-specific SMS
    const axios = require('axios');

    const response = await axios.get('https://api.msg91.com/apiv2/sendsms', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobiles: phone,
        message: `Your LocalEats verification code is: ${otp}. Valid for 10 minutes.`,
        route: process.env.MSG91_ROUTE,
        country: 91
      }
    });

    console.log('✅ OTP sent to', phone);
    return response.data;
  } catch (error) {
    console.error('❌ OTP sending error:', error.message);
    return null;
  }
};

// Send notification email template
const sendOrderNotification = async (email, orderData) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #FF6B35;">Order Update - LocalEats Kahalgaon</h2>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p><strong>Status:</strong> ${orderData.status}</p>
      <p><strong>Amount:</strong> ₹${orderData.amount}</p>
      <p><strong>Estimated Delivery:</strong> ${orderData.estimatedTime || 'Will be provided soon'}</p>
      <hr/>
      <p style="font-size: 12px; color: #666;">
        Need help? Contact us at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
  `;

  return sendEmail({
    email,
    subject: `Order ${orderData.status} - ${orderData.orderNumber}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendOTP,
  sendOrderNotification
};
