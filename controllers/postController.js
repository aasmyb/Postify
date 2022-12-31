const sharp = require('sharp');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Post = require('../models/postModel');
const uploader = require('../utils/multerUpload');
const clearImage = require('../utils/clearImage');
const io = require('../utils/socket');

exports.uploadPostPhoto = uploader.single('image');

exports.resizedPostPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `post-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg', undefined)
    .jpeg({ quality: 90 })
    .toFile(`public/img/posts/${req.file.filename}`);

  next();
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 1;
  const skip = (page - 1) * limit;

  const totalItems = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('creator');

  res.status(200).json({
    message: 'success',
    data: posts,
    totalItems,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const newPost = await Post.create({
    title,
    content,
    creator: req.user,
    imageUrl: req.file.filename,
  });

  // Live io
  io.getIO().emit('posts', { action: 'create', post: newPost });

  res.status(201).json({
    message: 'success',
    data: newPost,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError('No post was found with this ID!', 404));

  res.status(200).json({
    message: 'success',
    data: post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('creator');

  if (!post) return next(new AppError('No post was found with this ID!', 404));

  if (post.creator._id.toString() !== req.user._id.toString())
    return next(new AppError('You can only edit your posts!', 403));

  post.title = req.body.title;
  post.content = req.body.content;

  if (req.file) {
    clearImage(post.imageUrl, 'posts');
    post.imageUrl = req.file.filename;
  }

  await post.save();

  // Live io
  io.getIO().emit('posts', { action: 'update', post: post });

  res.status(200).json({
    message: 'success',
    data: post,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    creator: req.user,
  });

  if (!post)
    return next(
      new AppError('No post belongs to this user was found with this ID!', 404)
    );

  clearImage(post.imageUrl, 'posts');

  // Live io
  io.getIO().emit('posts', { action: 'delete', post: req.params.id });

  res.status(200).json({
    message: 'success',
    data: null,
  });
});
