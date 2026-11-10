const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { authLimiter, apiLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// rate limiting (auth routes se pehle)
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/colors', require('./routes/colorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// upload errors
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;