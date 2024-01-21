import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    body: { type: String, trim: true },
    commentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

const postSchema = mongoose.Schema(
  {
    content: { type: String, trim: true },
    image: {
      type: String,
      required: false,
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    images: [
      {
        url_image: { type: String, required: true },
        comments: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    reaction: [
      {
        type: { type: String, required: false },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsPost: [commentSchema],
    sharePost: {
      postShared: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sharedPostContent: { type: String, required: false },
    },
    // reaction: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],

    // sharePost: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Post',
    // },

    pinned: Boolean,
  },
  { timestamps: true }
);

// postSchema.index({ _id: 1 }, { unique: true });

const Post = mongoose.model('Post', postSchema);

export default Post;

// retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
// replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
