import express from 'express';

import { admin, protect } from '../middleware/authMiddleware.js';
import {
  addCommentToPost,
  addCommentToPostImage,
  addPostContent,
  addUpdateReactionToPost,
  deleteCommentToPost,
  deletePost,
  getAllFeedPost,
  getAllFriendPost,
  getComment,
  getCommentsToPostImage,
  getMyAllPosts,
  getPostsOfSharedPost,
  getSinglePost,
  removeCommentToPostImage,
  removingReactionToPost,
  sharePost,
  sharingASharedPost,
  updateCommentToPost,
  updateCommentToPostImage,
  updatePostContent,
} from '../controller/postController.js';

const router = express.Router();

router.route('/').get(protect, getMyAllPosts).post(protect, addPostContent);
router.route('/myPost').get(protect, getMyAllPosts);
router.route('/feedPost').get(protect, getAllFeedPost);
router.route('/getFriendPost/:userId').get(protect, getAllFriendPost);
router.route('/addReaction/:postId').put(protect, addUpdateReactionToPost);
router.route('/removeReaction/:postId').put(protect, removingReactionToPost);
router.route('/sharingSharedPost/:postId').post(protect, sharingASharedPost);
router.route('/sharedPosts/:postId').get(protect, getPostsOfSharedPost);

router
  .route('/addCommentToPostImage/:imageId/:postId')
  .put(protect, addCommentToPostImage);

router
  .route('/getPostImageComments/:imageId/:postId')
  .get(protect, getCommentsToPostImage);

router
  .route('/updateCommentToPostImage/:imageId/:postId/:commentId')
  .put(protect, updateCommentToPostImage);

router
  .route('/removeCommentToPostImage/:imageId/:postId/:commentId')
  .put(protect, removeCommentToPostImage);

router
  .route('/:postId')
  .get(protect, getSinglePost)
  .post(protect, sharePost)
  .put(protect, updatePostContent)
  .delete(protect, deletePost);

router.route('/comment/:postId').post(protect, addCommentToPost);
router.route('/comment/:commentId/:postId').get(protect, getComment);
//
router
  .route('/comment/:postId/:commentId')
  .put(protect, updateCommentToPost)
  .delete(protect, deleteCommentToPost);
export default router;
