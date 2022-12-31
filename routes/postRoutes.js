const express = require('express');

const postController = require('../controllers/postController');
const validationController = require('../controllers/validationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').get(postController.getAllPosts).post(
  postController.uploadPostPhoto,
  validationController.createPostVal, // validation needs to be after multer
  validationController.checkValidation,
  postController.resizedPostPhoto,
  postController.createPost
);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    postController.uploadPostPhoto,
    validationController.createPostVal, // validation needs to be after multer
    validationController.checkValidation,
    postController.resizedPostPhoto,
    postController.updatePost
  )
  .delete(postController.deletePost);
module.exports = router;
