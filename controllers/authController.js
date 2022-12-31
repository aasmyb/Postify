const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');

const createSendToken = (req, res, statusCode, user) => {
  const token = user.signJWT();

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    userId: user._id,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(req, res, 201, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkCorrectPassword(password)))
    return next(new AppError('Invalid email or password.', 401));

  createSendToken(req, res, 200, user);
});

exports.getUserStatus = (req, res, next) => {
  res.status(200).json({
    message: 'success',
    status: req.user.status,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token, check if it exists
  let token;
  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError('You are not logged in, please log in to have access', 401)
    );

  // 2) Verify the token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) Check if user still exists
  const freshUser = await User.findById(decodedToken.id);
  if (!freshUser)
    return next(
      new AppError(
        'The user belonging to this token does not longer exist',
        401
      )
    );

  // 4) If user changed password after awt was issued
  // if (freshUser.detectChangedPass(decodedToken.iat))
  //   return next(
  //     new AppError(
  //       'This user recently changed password, please log in again',
  //       401
  //     )
  //   );

  // Grant access to protected route
  req.user = freshUser;
  next();
});
