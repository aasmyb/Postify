const express = require('express');

const authController = require('../controllers/authController');
const validationController = require('../controllers/validationController');

const router = express.Router();

router.post(
  '/signup',
  validationController.signupVal,
  validationController.checkValidation,
  authController.signup
);

router.post(
  '/login',
  validationController.loginVal,
  validationController.checkValidation,
  authController.login
);

router.get('/status', authController.protect, authController.getUserStatus);

module.exports = router;
