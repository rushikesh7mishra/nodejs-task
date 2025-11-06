const nodemailer = require('nodemailer');
const config = require('../config');

// For demo only: send using ethereal or console
const transporter = nodemailer.createTransport({
  // For production replace with SMTP config.
  jsonTransport: true
});

exports.sendOrderConfirmation = async (order) => {
  const html = `<p>Order ${order._id} confirmed. Total: ${order.totalAmount}</p>`;
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: 'customer@example.com', // in real world use user's email
    subject: `Order ${order._id} confirmed`,
    html
  });
};
