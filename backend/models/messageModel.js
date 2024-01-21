import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    isUnsent: { type: Boolean },
    replyingTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        readDate: { type: Date, default: Date.now },
      },
    ],
    images: {
      type: [String],
      required: false,
    },

    // post_images: [
    //   {
    //     image_name: {
    //       type: [String],
    //       required: false,
    //       user: { type: Schema.Types.ObjectId, ref: 'User' },
    //     },
    //   },
    // ],

    reaction: [
      {
        type: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Message', messageSchema);

const Message = mongoose.model('Message', messageSchema);

export default Message;
