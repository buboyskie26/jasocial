import asyncHandler from '../middleware/asyncHandler.js';
import Comment from '../models/commentModel.js';

const addCommentToPost = asyncHandler(async (req, res) => {

  const { body } = req.body;
  const postId = req.params.postId;

  const createdComment = await Comment.create({
    body,
    commentBy: req.user._id,
    post: postId,
  });

  if (createdComment) {
    res.status(200).json({message:"You have successfully provided a comment on the post"});
  } else {
    res.status(401);
    throw new Error('Could`nt add a comment to a post');
  }
});

export { addCommentToPost };
