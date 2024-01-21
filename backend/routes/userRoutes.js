import express from 'express';
import {
  acceptFriendRequest,
  addFriendToUser,
  authUser,
  deletingFriendRequest,
  getAllMyFriendRequestsFromOther,
  getAllMyFriendRequestsToOther,
  getFriendRequestOfInitiatedUser,
  getFriendRequestOfUnInitiatedUser,
  getSingleUser,
  getUserProfile,
  logoutUser,
  registerUser,
  setUserLoggedIn,
  setUserLoggedOut,
} from '../controller/userController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser);
router.route('/auth').post(authUser);
router.route('/setToLoggedIn/:userId').put(setUserLoggedIn);
router.route('/setToLoggedOut/:userId').put(setUserLoggedOut);
router.route('/logout').post(logoutUser);
router.route('/friendRequest/:userId').put(protect, addFriendToUser);
router.route('/getUser/:userId').get(protect, getSingleUser);
router.route('/getProfile/:userId').get(protect, getUserProfile);
router
  .route('/friendRequestsToOther')
  // .get(protect, getAllMyFriendRequestsToOther)
  .get(protect, getFriendRequestOfInitiatedUser);
router
  .route('/friendRequestFromOther')
  // .get(protect, getAllMyFriendRequestsFromOther)
  .get(protect, getFriendRequestOfUnInitiatedUser);

router.route('/friendRequestAccept/:userId').put(protect, acceptFriendRequest);
router
  .route('/friendRequestRemoval/:userId')
  .put(protect, deletingFriendRequest);
export default router;
