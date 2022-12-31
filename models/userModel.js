const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: [3, 'User name must cannot be less than 3 characters.'],
    required: [true, 'A user must have a name.'],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'A user must have an email.'],
    validate: [validator.isEmail, 'Please use a valid email.'],
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'A user must have a name.'],
    minlength: [8, 'User password must cannot be less than 3 characters.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User confirm your password'],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  status: {
    type: String,
    default: 'I am new!',
  },
});

// Query middlewares

// Handle hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// Instance methods
userSchema.methods.signJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

userSchema.methods.checkCorrectPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
