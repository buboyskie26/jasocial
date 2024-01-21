import express from 'express';

import { admin, protect } from '../middleware/authMiddleware.js';
import { addCommentToPost } from '../controller/commentController.js';

const router = express.Router();

router.route('/:postId').post(protect, addCommentToPost);

export default router;
