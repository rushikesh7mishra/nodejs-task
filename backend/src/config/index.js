module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'change_this',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  APP_URL: process.env.APP_URL || 'http://localhost:5000',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@example.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET
};
