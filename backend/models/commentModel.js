import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    body: { type: String, trim: true },
    commentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
