import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    // All users that are involve the chat.
    // latestMessageViewed: { type: Boolean },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
