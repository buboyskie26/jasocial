//
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
// import socketIo from 'socket.io';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectionDB from './config/db.js';
import { Server } from 'socket.io';

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allows us to access req.cookies
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

if (process.env.NODE_ENV === 'production') {
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(`Mini Social Network server is running on port ${port}`)
);
// app.listen(port, () => console.log(`Social Server is running on port ${port}`));

export const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

// const userId = socket?.request?.user?._id;

// if (userId) {
//   console.log(`User connected ${socket.id}, User ID: ${userId}`);
// } else {
//   console.log('User ID is not available.');
// }
// // Store the user's ID in the onlineUsers object
// onlineUsers[socket.id] = true;

// // Broadcast the updated list of online users to all clients
// io.emit('online_users', Object.keys(onlineUsers));

const onlineUsers = {};
const onlineUsersArray = [];

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  // // Listen for a new user to be added online
  // socket.on('added_online_user', (data) => {
  //   // Add the user to the online users array
  //   onlineUsersArray.push(data.onlineUserId);

  //   // Notify all clients about the updated online users array
  //   io.emit('receive_added_online_user', onlineUsersArray);
  // });

  socket.on('send_message_chat', (data) => {
    // console.log(data);
    socket.broadcast.emit('receive_message_chat', data);

    // Clear typing indicator when a message is sent
    socket.broadcast.emit('typing', { isTyping: false });
  });

  socket.on('send_update_msg_sent', (data) => {
    // console.log(data);
    socket.broadcast.emit('receive_send_update_msg_sent', data);
  });

  socket.on('update_online_user', (data) => {
    socket.broadcast.emit('receive_online_user', data);
  });
  socket.on('update_chat_messages', (data) => {
    socket.broadcast.emit('receive_chat_messages', data);
  });
  socket.on('other_user_viewed_the_chat', (data) => {
    socket.broadcast.emit('receive_other_user_viewed_the_chat', data);
  });
  socket.on('other_user_seen_chat_inside_chat_message', (data) => {
    socket.broadcast.emit(
      'receive_other_user_seen_chat_inside_chat_message',
      data
    );
  });

  // Handling typing indicators
  socket.on('typing', ({ isTyping }) => {
    socket.broadcast.emit('typing', { isTyping });
  });

  // Handle user disconnect
  // socket.on('disconnect', () => {
  //   // Remove the disconnected user from the online users array
  //   const index = onlineUsersArray.indexOf(socket.id);
  //   if (index !== -1) {
  //     onlineUsersArray.splice(index, 1);

  //     // Notify all clients about the updated online users array
  //     io.emit('receive_added_online_user', onlineUsersArray);
  //   }
  // });
});

connectionDB();
