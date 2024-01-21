import express from 'express';

import { admin, protect } from '../middleware/authMiddleware.js';
import {
  addGroupChat,
  addUpdateReactionToMessage,
  getChatMessages,
  getChatObj,
  getGroupChatMessages,
  getUserChats,
  messageReplyToUser,
  messageToGroupChat,
  messageUser,
  removeAllMessages,
  removingReactionToMessage,
  unsentMyMessage,
  autoAddChat,
} from '../controller/messageController.js';

const router = express.Router();

router.route('/getChatMessages/:userId').get(protect, getChatMessages);
router.route('/removeAllMessages').delete(protect, removeAllMessages);

router.route('/getChatUsers/').get(protect, getUserChats);
router.route('/getChatObj/:chatId').get(protect, getChatObj);

router
  .route('/getGroupChatMessages/:chatId')
  .get(protect, getGroupChatMessages);

router
  .route('/replyToUserMessage/:messageId')
  .post(protect, messageReplyToUser);

router.route('/addGroupChat').post(protect, addGroupChat);

router.route('/autoAddChat/:userId').post(protect, autoAddChat);

router.route('/messageToGroupChat/:chatId').post(protect, messageToGroupChat);
router
  .route('/addReaction/:messageId')
  .put(protect, addUpdateReactionToMessage);

router.route('/unsentMessage/:messageId').put(protect, unsentMyMessage);

router
  .route('/removeReaction/:messageId')
  .put(protect, removingReactionToMessage);
router.route('/:userId').post(protect, messageUser);

export default router;
