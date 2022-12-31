const { check, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.checkValidation = (req, res, next) => {
  let errorMessage;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    errorMessage = errors.array()[0].msg;

    if (req.file) req.file.buffer = undefined;

    return next(new AppError(errorMessage, 422));
  }

  next();
};

exports.createPostVal = [
  check(['title', 'content'], 'You must fill all values!')
    .notEmpty()
    .trim()
    .isLength({ min: 5 }),
  // check('title', 'Please enter a valid title(4-40 characters).').isLength({
  //   min: 4,
  //   max: 40,
  // }),
  // check('imageUrl', 'Please enter a valid URL.').isURL(),
  // check('price', 'Price must be above 1.0.').isInt({ min: 1 }),
];

exports.signupVal = [
  check(
    ['email', 'name', 'password', 'passwordConfirm'],
    'You must fill all values!'
  )
    .notEmpty()
    .trim(),
  check('email', 'Please enter a valid email.').isEmail().normalizeEmail(),
  check('name', 'Please enter a valid name(more than 3 characters).').isLength({
    min: 3,
  }),
  check('password', 'A password can not be less than 8 characters.').isLength({
    min: 8,
  }),
  check('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

exports.loginVal = [
  check(['email', 'password'], 'You must fill all values!').notEmpty().trim(),
  check('email', 'Please enter a valid email.').isEmail().normalizeEmail(),
  check('password', 'A password can not be less than 8 characters.').isLength({
    min: 8,
  }),
];
