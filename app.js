const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const postRouter = require('./routes/postRoutes');
const authRouter = require('./routes/authRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Parsing body/cookies
app.use(express.json());
app.use(cookieParser());

// Allowing CORS
app.use(cors());
app.options('*', cors());

// Serving static files
app.use('/api/v1', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/auth', authRouter);

// Unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(globalErrorHandler);

module.exports = app;
