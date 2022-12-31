const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'A post must have a title'],
      minlength: [5, 'Post title can be at least 5 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'A post must have an image.'],
    },
    content: {
      type: String,
      required: [true, 'A post must have a content'],
      minlength: [5, 'Post content can be at least 5 characters'],
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must have a creator'],
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
