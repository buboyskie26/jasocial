import asyncHandler from '../middleware/asyncHandler.js';
import Chat from '../models/chatModel.js';
import Message from '../models/messageModel.js';
import { io } from '../server.js';

const getUserChats = asyncHandler(async (req, res) => {
  //

  // const myChats = await Chat.find({
  //   users: { $all: [req.user._id] },
  // })
  //   .populate('users')
  //   .populate('latestMessage')
  //   .populate({
  //     path: 'latestMessage',
  //     populate: {
  //       path: 'sender',
  //     },
  //   })
  //   .sort({ 'latestMessage.createdAt': -1 });

  // const myChats = await Chat.aggregate([
  //   {
  //     $match: {
  //       users: { $all: [req.user._id] },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'messages',
  //       localField: 'latestMessage',
  //       foreignField: '_id',
  //       as: 'latestMessage',
  //     },
  //   },
  //   {
  //     $sort: {
  //       'latestMessage.createdAt': -1,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'users', // Assuming the collection name for users is 'users'
  //       localField: 'latestMessage.sender',
  //       foreignField: '_id',
  //       as: 'latestMessage.sender',
  //     },
  //   },
  //   {
  //     $unwind: '$latestMessage.sender', // Unwind the array created by $lookup
  //   },
  // ]);

  // As long as theres a chat

  const myChats = await Chat.find({
    users: { $all: [req.user._id] },
  })
    .populate('users')
    .populate('latestMessage')
    .populate({
      path: 'latestMessage',
      populate: {
        path: 'readBy.user', // Corrected from 'latestMessage.readBy.user'
      },
    })
    .populate({
      path: 'latestMessage',
      populate: {
        path: 'sender',
      },
    });

  // Filter out chats without latestMessage
  // const filteredChats = myChats.filter((chat) => chat.latestMessage);
  // const nonfilteredChats = myChats.filter((chat) => chat.latestMessage);

  // Sort the result array in descending order based on latestMessage.createdAt
  // filteredChats.sort(
  //   (a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt
  // );

  if (myChats) {
    myChats.sort(
      (a, b) => b.latestMessage?.createdAt - a.latestMessage?.createdAt
    );

    res.status(201).json(myChats);
  } else {
    res.status(500).json({ message: 'You dont have any chats.' });
  }
  //
});

const getAllMessagesInChat = asyncHandler(async (req, res) => {
  //
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    res
      .status(500)
      .json({ message: 'Getting messages to yourself is not allowed.' });
    return;
  }

  const existingChat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate('users')
    .populate('latestMessage')
    .populate('latestMessage.readBy');

  if (existingChat) {
    //
    let existingMessages = await Message.find({
      chat: existingChat._id,
    })
      .populate('sender')
      .populate({
        path: 'replyingTo',
        populate: {
          path: 'sender',
        },
      })
      .populate('reaction.user')
      .populate('readBy.user');
    // .sort({ createdAt: -1 });

    let chatWithMessages = {
      chat: existingChat,
      messages: existingMessages,
    };

    // Readby user insertion for the most recent message (Only one).
    // Check first if the logged-in user already exists in the readBy

    const recentMessage = existingMessages[existingMessages.length - 1];

    // res.send(recentMessage);
    // console.log(recentMessage);
    // return;

    const alreadyRead = recentMessage.readBy.find(
      (w) => w.user._id.toString() === req.user._id.toString()
    );

    // console.log(alreadyRead);

    if (!alreadyRead) {
      recentMessage.readBy.push({ user: req.user._id });
      const doesSave = await recentMessage.save();

      existingMessages = await Message.find({
        chat: existingChat._id,
      })
        .populate('reaction.user')
        .populate('sender')
        .populate('replyingTo')
        .populate('replyingTo.sender')
        .populate('readBy.user');
      // .sort({ createdAt: -1 });

      chatWithMessages = {
        chat: existingChat,
        messages: existingMessages,
      };
    }

    res.status(201).json(chatWithMessages);
    //
  } else {
    // res.status(500).json({ message: 'Could not get the chat.' });
    res.status(201).json([]);
  }
});

const getChatObj = asyncHandler(async (req, res) => {
  //
  const { chatId } = req.params;

  const existingChat = await Chat.findOne({ _id: chatId })
    .populate('users')
    .populate('latestMessage')
    .populate('latestMessage.readBy')
    .populate({
      path: 'latestMessage',
      populate: {
        path: 'readBy.user', // Corrected from 'latestMessage.readBy.user'
      },
    });

  if (existingChat) {
    res.status(200).send(existingChat);
  } else {
    res.status(500).send({ message: 'Chat not exist' });
  }
});

const getChatMessages = asyncHandler(async (req, res) => {
  //
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    res
      .status(500)
      .json({ message: 'Getting messages to yourself is not allowed.' });
    return;
  }

  const existingChat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  })
    .populate('users')
    .populate('latestMessage')
    .populate('latestMessage.readBy');
  // .populate({
  //   path: 'latestMessage',
  //   populate: {
  //     path: 'readBy.user', // Corrected from 'latestMessage.readBy.user'
  //   },
  // });
  // .populate({
  //   path: 'latestMessage.readBy',
  //   populate: {
  //     path: 'user',
  //   },
  // });

  if (existingChat) {
    // res.send(existingChat);
    // return;
    //
    let existingMessages = await Message.find({
      chat: existingChat._id,
    })
      .populate('sender')
      .populate({
        path: 'replyingTo',
        populate: {
          path: 'sender',
        },
      })
      .populate('reaction.user')
      .populate('readBy.user');
    // .sort({ createdAt: -1 });

    let chatWithMessages = {
      chat: existingChat,
      messages: existingMessages,
    };
    // res.send(chatWithMessages);

    // Readby user insertion for the most recent message (Only one).
    // Check first if the logged-in user already exists in the readBy

    if (existingMessages.length > 1) {
      const recentMessage = existingMessages[existingMessages.length - 1];
      const alreadyRead = recentMessage.readBy.find(
        (w) => w.user._id.toString() === req.user._id.toString()
      );

      if (!alreadyRead) {
        recentMessage.readBy.push({ user: req.user._id });
        const doesSave = await recentMessage.save();

        existingMessages = await Message.find({
          chat: existingChat._id,
        })
          .populate('reaction.user')
          .populate('sender')
          .populate('replyingTo')
          .populate('replyingTo.sender')
          .populate('readBy.user');
        // .sort({ createdAt: -1 });

        chatWithMessages = {
          chat: existingChat,
          messages: existingMessages,
        };
      }
    }

    res.status(201).json(chatWithMessages);
    //
  } else {
    // res.status(500).json({ message: 'Could not get the chat.' });
    res.status(201).json([]);
  }
});

// Check if chat Id exists between you and user you would want to message
// To check if user has chat Id exists between the user, is by
// getting the users id from the chat schema
// if not exists create one chat Id, else use that chat Id

const messageUser = asyncHandler(async (req, res) => {
  const { content, imagesUploads } = req.body;

  // console.log(imagesUploads);
  // return;
  // const { content, image } = req.body;
  const { userId } = req.params;

  // const createMessages = await Message.create({
  //   content,
  //   chat: chatId,
  //   sender: req.user._id,
  //   // images: imagesUploads,
  //   image: image,
  // });

  // Check if a chat already exists between the users
  //   Get Chat object with  users: { $all: [req.user._id, userId] },

  const existingChat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  });

  let chatId = null;

  if (existingChat) {
    // Use existing chat
    chatId = existingChat._id;
  } else {
    // Create a new chat
    const createChat = await Chat.create({
      chatName: '',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    if (createChat) {
      chatId = createChat._id;
    } else {
      res.status(500).json({ message: 'Could not create a chat' });
      return; // Return early to avoid further execution
    }
  }

  if (chatId !== null) {
    // Create a new message
    const createMessage = await Message.create({
      content,
      chat: chatId,
      sender: req.user._id,
      // image: image,
      images: imagesUploads,
    });

    if (createMessage) {
      // Update the Chat Latest Message.
      const chatObj = await Chat.findOne({
        _id: chatId,
      });

      chatObj.latestMessage = createMessage._id;
      await chatObj.save();

      res.status(200).json(createMessage);
    } else {
      res.status(500).json({ message: 'Could not create a message' });
    }
  }
});

const messageReplyToUser = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { messageId } = req.params;

  // Check if a chat already exists between the users
  //   Get Chat object with  users: { $all: [req.user._id, userId] },

  let chatId = null;

  const messageObj = await Message.findOne({ _id: messageId });
  chatId = messageObj.chat;

  // Create a new message
  const createReplyMessage = await Message.create({
    content,
    chat: chatId,
    sender: req.user._id,
    replyingTo: messageId,
  });

  if (createReplyMessage) {
    // Update the Chat Latest Message.
    const chatObj = await Chat.findOne({
      _id: chatId,
    });

    chatObj.latestMessage = createReplyMessage._id;
    await chatObj.save();

    res.status(200).json(createReplyMessage);
  } else {
    res.status(500).json({ message: 'Could not create a reply message' });
  }
});

const addUpdateReactionToMessage = asyncHandler(async (req, res) => {
  //
  //
  const { messageReaction } = req.body;

  //   console.log(messageReaction);
  //   return;

  const { messageId } = req.params;

  const userId = req.user._id; // Assuming you have the user's ID in the request

  const getMessage = await Message.findOne({ _id: messageId });

  if (!getMessage) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  // Check if the user has already reacted
  //   const existingReaction = getMessage.reaction.find(
  //     (reaction) =>
  //       reaction.user.equals(userId.toString()) &&
  //       reaction.type === messageReaction.toString()
  //   );

  const reactionIndex = getMessage.reaction.findIndex((reaction) =>
    reaction.user.equals(userId.toString())
  );

  //   console.log(getMessage);
  //   return;

  let type_status = null;

  if (reactionIndex !== -1) {
    // update the reaction type.

    getMessage.reaction[reactionIndex].set({ type: messageReaction });
    type_status = 'update';
  } else {
    getMessage.reaction.push({
      type: messageReaction,
      user: req.user._id,
    });
    type_status = 'create';
  }

  //   console.log(type_status);
  //   return;

  const updatedPost = await getMessage.save();

  if (updatedPost) {
    if (type_status === 'update') {
      res.status(200).json({
        message: `You have successfully change your reaction with ${messageReaction} on a message`,
      });
    } else {
      res.status(200).json({
        message: `You have successfully reacted with ${messageReaction} on a message`,
      });
    }
  } else {
    res.status(500).json({ message: 'Failed to update the post' });
  }
  //
});

const removingReactionToMessage = asyncHandler(async (req, res) => {
  //
  const messageId = req.params.messageId;
  const userId = req.user._id;

  const messagePost = await Message.findOne({ _id: messageId });

  if (!messagePost) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  const reactionIndex = messagePost.reaction.findIndex((reaction) =>
    reaction.user.equals(userId.toString())
  );

  if (reactionIndex !== -1) {
    // messagePost.reaction[reactionIndex].set({ type: postReaction });
    messagePost.reaction.splice(reactionIndex, 1);
  }

  const updatedPost = await messagePost.save();

  if (updatedPost) {
    res.status(200).json({
      message: `You have successfully remove your reaction on a post`,
    });
  } else {
    res
      .status(500)
      .json({ message: 'Failed to remove the reaction to a post' });
  }

  //
});

const unsentMyMessage = asyncHandler(async (req, res) => {
  //
  const messageId = req.params.messageId;
  const userId = req.user._id;

  const messagePost = await Message.findOne({ _id: messageId, sender: userId });

  if (!messagePost) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  messagePost.isUnsent = true;

  const updatedPost = await messagePost.save();

  if (updatedPost) {
    res.status(200).json({
      message: `You have successfully unsent a message.`,
    });
  } else {
    res.status(500).json({ message: 'Failed to unsent a message' });
  }
});

const autoAddChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // For Non-group chat
  // Check if other user and loggedin user have their chat id
  // If it does, dont create, else, create.

  const existingChat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  });
  //

  if (existingChat) {
    //
    res
      .status(500)
      .json({ message: 'Chat has been already created with user. (Non-gc)' });

    // return;
  }
  if (!existingChat) {
    const createChat = await Chat.create({
      chatName: '',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    if (createChat) {
      res.status(200).json(createChat);
      // res.status(200).json({ data: createChat });
    } else {
      // res.status(500).json({ error: { message: 'Could not create a chat' } });
      res
        .status(500)
        .json({ message: 'Chat has been already created with user. (Non-gc)' });
    }
  }
});

const addGroupChat = asyncHandler(async (req, res) => {
  const { users, chatName } = req.body;

  if (users.length > 0) {
    users.push(req.user._id.toString());
  }

  const createChat = await Chat.create({
    chatName: chatName,
    isGroupChat: true,
    users: users,
  });

  if (createChat) {
    res.status(200).json(createChat);
  } else {
    res.status(500).json({ message: 'Could not create a message' });
  }
});

const messageToGroupChat = asyncHandler(async (req, res) => {
  //
  const { content } = req.body;
  const { chatId } = req.params;

  // Check if a chat already exists between the users
  //   Get Chat object with  users: { $all: [req.user._id, userId] },

  // Add, make sure you are involve in the group chat. (Authorization)
  const existingChat = await Chat.findOne({
    _id: chatId,
    users: { $all: [req.user._id] },
  });

  if (existingChat) {
    // Create a new message
    const createMessage = await Message.create({
      content,
      chat: existingChat._id,
      sender: req.user._id,
    });

    if (createMessage) {
      // Update the Chat Latest Message.
      const chatObj = await Chat.findOne({
        _id: chatId,
      });

      chatObj.latestMessage = createMessage._id;
      await chatObj.save();

      res.status(200).json(createMessage);
    } else {
      res
        .status(500)
        .json({ message: 'Could not create a message with a group chat.' });
    }
  } else {
    res.status(500).json({ message: 'Could not create a chat' });
    return; // Return early to avoid further execution
  }
});

const getGroupChatMessages = asyncHandler(async (req, res) => {
  //
  const { chatId } = req.params;

  // Check if logged in user is involved with the group chat.
  const existingChat = await Chat.findOne({
    _id: chatId,
    users: { $all: [req.user._id] },
  }).populate('latestMessage.readBy');

  if (existingChat) {
    let existingMessages = await Message.find({
      chat: chatId,
    })

      .populate('readBy.user')
      // .sort({ createdAt: -1 })
      .sort({ createdAt: -1, 'readBy.readDate': -1 });

    let chatWithMessages = {
      chat: existingChat,
      messages: existingMessages,
    };

    // Readby user insertion for the most recent message (Only one).
    // Check first if the logged-in user already exists in the readBy

    const recentMessage = existingMessages[0];

    const alreadyRead = recentMessage.readBy.find(
      (w) => w.user._id.toString() === req.user._id.toString()
    );

    // console.log(alreadyRead);

    if (!alreadyRead) {
      recentMessage.readBy.push({ user: req.user._id });
      const doesSave = await recentMessage.save();

      existingMessages = await Message.find({
        chat: existingChat._id,
      })
        .populate('readBy.user')
        .sort({ createdAt: -1, 'readBy.readDate': -1 });

      chatWithMessages = {
        chat: existingChat,
        messages: existingMessages,
      };
    }

    res.status(201).json(chatWithMessages);
    //
  } else {
    res.status(500).json({ message: 'Could not get the group chat.' });
  }
});
const removeAllMessages = asyncHandler(async (req, res) => {
  // Check if logged in user is involved with the group chat.
  const deleteAllMessages = await Message.deleteMany();
  // Handle the result or send a response as needed.
  res
    .status(201)
    .json({ success: true, message: 'All messages deleted successfully.' });
});

export {
  getChatMessages,
  messageUser,
  addUpdateReactionToMessage,
  removingReactionToMessage,
  unsentMyMessage,
  addGroupChat,
  messageToGroupChat,
  getGroupChatMessages,
  messageReplyToUser,
  getUserChats,
  removeAllMessages,
  getChatObj,
  autoAddChat,
};
