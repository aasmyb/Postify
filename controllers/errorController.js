const AppError = require('../utils/appError');

const sendProdOperationalError = (err, req, res) => {
  // Operational errors which are trusted errors => we send it to client
  console.log('Error 😡💢', err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendProdProgrammingErrors = (err, req, res) => {
  // Programming or other unknown errors => don't leak error details
  // 1) log error to server console
  console.log('Error 😡💢', err);
  // 2) send generic error message to user
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  let message, dupValue;

  // Handle duplicated reviews/bookings
  // if (err?.keyPattern?.user && err?.keyPattern?.tour) {
  //   dupValue = err.errmsg.match(/(?<=natours\.).*?(?=\s)/)[0];
  //   message = `You can not add a ${dupValue.slice(
  //     0,
  //     -1
  //   )} for the same tour twice!`;
  //   return new AppError(message, 400);
  // }

  const dupKey = Object.keys(err?.keyValue)[0];
  dupValue = Object.values(err?.keyValue)[0];
  message = `This ${dupKey}: (${dupValue}) is already in use! Please use another one.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(errEl => errEl.message);
  const message = `Invalid input data; ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please log in again', 401);

const sendErrorDev = (err, req, res) => {
  console.log('Error 😡💢', err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  }
  if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  }
  if (err.name === 'ValidationError') {
    err = handleValidationErrorDB(err);
  }
  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }
  if (err.isOperational) sendProdOperationalError(err, req, res);
  else sendProdProgrammingErrors(err, req, res);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, req, res);
  }
};
