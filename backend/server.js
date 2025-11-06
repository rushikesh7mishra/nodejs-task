require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { initAgenda } = require('./src/jobs/agenda');
const config = require('./src/config');
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const cartRoutes = require('./src/routes/cart.routes');
const orderRoutes = require('./src/routes/order.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { errorHandler } = require('./src/middleware/error.middleware');

const app = express();

// Health check route - AT THE VERY TOP, before any middleware
app.get('/api/health', (req, res) => {
  console.log('✅ Health endpoint accessed successfully!');
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Now add middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('MongoDB connected');

    await initAgenda();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();