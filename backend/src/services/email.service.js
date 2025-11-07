const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  jsonTransport: true
});

exports.sendOrderConfirmation = async (order) => {
  const html = `<p>Order ${order._id} confirmed. Total: ${order.totalAmount}</p>`;
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: 'customer@example.com',
    subject: `Order ${order._id} confirmed`,
    html
  });
};
