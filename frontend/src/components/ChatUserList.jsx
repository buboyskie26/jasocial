import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetChatObjectQuery,
  useGetChatUsersQuery,
} from '../slices/messagesApiSlice';
import Loader from './Loader';
import Message from './Message'; // Make sure to import the Message component
import { Link } from 'react-router-dom';
import { useGetSingleUserQuery } from '../slices/usersApiSlice';
import io from 'socket.io-client';
const socket = io('http://localhost:5000'); // Replace with your server URL

const ChatUserList = ({ chatObj, refetchMessageInChat, oneToOneUserId }) => {

  const {
    data: chatUsers,
    refetch: refetchChatUsers,
    isLoading: loadingChatUsers,
    error: errorChatUsers,
  } = useGetChatUsersQuery();

  console.log(chatUsers);

  const { userInfo } = useSelector((w) => w.auth);
  let loggedInUserId = userInfo?._id;

  const chatUserOneToOne = (users) => {
    const userObj = users.find((user) => user._id !== userInfo._id);
    return userObj || {};
  };

  const openChatIndicator = (selectedChatId) => {
    // const doesSelectedChat =
    //   chatUsers?.findIndex((w) => w._id === chatObj?._id) !== -1;
    if (selectedChatId) {
      const doesSelectedChat = selectedChatId === chatObj?._id;
      return doesSelectedChat;
    }
  };

  const doesReadMessageInTheChat = (selectedChat) => {
    if (selectedChat) {
      const doesSelectedChat =
        selectedChat?.latestMessage?.readBy.findIndex(
          (w) => w.user === userInfo._id
        ) !== -1;

      return doesSelectedChat;
    }
  };

  const doesUserSendTheLatestMessage = (latestMessage) => {
    return latestMessage?.sender?._id === userInfo._id;
  };

  const doesViewedMessageInTheChat = (latestMessage) => {
    // if (doesUserSendTheLatestMessage) {
    if (latestMessage && latestMessage.sender?._id === userInfo._id) {
      // console.log(latestMessage);
      const getOtherUser = latestMessage?.readBy.find(
        (w) => w.user._id !== userInfo._id
      );
      // console.log(getOtherUser);

      if (getOtherUser !== undefined) {
        // console.log(getOtherUser);
        return getOtherUser?.user;
      }
    }
    return {};
  };

  // This should click If Jane send a message to John, and John is within the chat message with Jane
  // Then, John Message chat message will click itself automatically.

  const refetchUserClick = (userId, chatId, latestMessageId, userObj) => {
    if (userId && chatId) {
      console.log(`test click  chatId ${chatId}`);

      socket.emit('other_user_viewed_the_chat', {
        otheruserId: userId,
        loggedInUserId: userInfo._id,
        chatId: chatId,
        clicklatestMessageId: latestMessageId,

        otherUserObj: userObj,
        loggedInUserObj: userInfo,
      });
    }
  };

  // const doesOtherUserViewedTheMessage = (selectedChat) => {
  //   console.log(selectedChat);

  //   const doesViewed =
  //     selectedChat?.latestMessage?.readBy.findIndex(
  //       (w) => w.user === userInfo._id
  //     ) !== -1;

  //   return doesSelectedChat;
  // };
  // useEffect(() => {
  //   if (refetchMessageInChat) {
  //     refetchChatUsers();
  //   }
  // }, [refetchMessageInChat, refetchChatUsers]);

  // If Jane send a message to John, and John is within the chat message with Jane
  // Then, John Message chat message will click itself automatically.

  //
  // After user sends message from MessageScreen, it will refetchChatUsers
  //
  const [sample, setSample] = useState(false);

  useEffect(() => {
    // Subscribe to the 'receive_online_user' event when the component mounts

    const receiveOnlineUserHandler = (data) => {
      // console.log(data);

      if (data?.onlineUserId && chatUsers.length > 0) {
        const userToRefresh = chatUsers.find((chat) => {
          return chat.users.some((user) => user._id === data.onlineUserId);
        });

        if (userToRefresh) {
          // If you need to update UI or data, consider doing it directly
          // instead of always refetching the entire chat users
          refetchChatUsers();
          // setStatus('Online');
          console.log('User found, update UI or data as needed');
        } else {
          // setStatus('Offline');
        }
      }
    };

    socket.on('receive_online_user', receiveOnlineUserHandler);

    // // Unsubscribe when the component unmounts
    return () => {
      socket.off('receive_online_user', receiveOnlineUserHandler);
    };
  }, [chatUsers, userInfo, refetchChatUsers]);

  const [userClickLatestMsg, setUserClickLatestMsg] = useState(null);

  useEffect(() => {
    // Subscribe to the 'receive_chat_messages' event when the component mounts
    const receiveMessageHandler = (data) => {
      // Get the latestMessage according to your chat ID.

      // console.log(data);
      if (
        data?.messageObj &&
        // chatUsers?.findIndex((w) => w._id === data?.chatId) !== -1
        chatObj?._id === data?.chatId
      ) {
        //
        const chatUsersInvolve = data.messageObj;

        chatUsersInvolve.forEach((user) => {
          if (user._id === userInfo._id) {
            refetchChatUsers();

            // This make sure, if user (from the left) sends a message
            // The viewed indicator will reset.
            setUserClickLatestMsg(null);
            // setSample(true);

            // console.log(chatUsers);
          } else {
            // console.log('You`re not involved in the chat');
          }
        });
      }

      // if (
      //   data?.latestMessageId &&
      //   data?.sender &&
      //   data?.sender === userInfo._id
      // ) {
      //   console.log(`data?.latestMessageId: ${data?.latestMessageId}`);
      // }

      // console.log(data);

      // const isChatEqual = data?.chat?._id === chatObj._id;
      // const isMessageEquald = data?.chat?.latestMessage._id === chatObj._id;

      // if (
      //   data?.sender &&
      //   data?.latestMessageId &&
      //   data?.receiver &&
      //   data?.receiver === userInfo._id
      // ) {
      //   //
      //   chatUsers.forEach((w) => {
      //     if (
      //       w.latestMessage._id === data?.chat?.latestMessage._id &&
      //       w._id === data?.chat?._id
      //     ) {
      //       const equalMessageId = data?.latestMessageId;
      //       const equaChatId = data?.chat?._id;

      //       socket.emit('other_user_seen_chat_inside_chat_message', {
      //         otherUserIdWhoSeenTheChat: data?.receiver,
      //         userWhoCreatedTheMessage: data?.sender,
      //         equalMessageId,
      //         equaChatId,
      //       });

      //       console.log(`latestMessageId: ${w.latestMessage._id}`);
      //       console.log(`chat ID: ${w._id}`);

      //       console.log(`data?.latestMessageId: ${data?.latestMessageId}`);
      //     }
      //   });
      // }

      // console.log('recevied_update_chat');
      // refetchChatUsers();
    };

    socket.on('receive_chat_messages', receiveMessageHandler);

    // Unsubscribe when the component unmounts
    return () => {
      socket.off('receive_chat_messages', receiveMessageHandler);
    };
  }, [chatUsers, userInfo, refetchChatUsers, chatObj]);

  
  useEffect(() => {
    //
    // Subscribe to the 'receive_other_user_viewed_the_chat' event when the component mounts
    const receiveOtherUserViewedTheChat = (data) => {
      // Check if loggedInUserId from other Chat ( One to One )
      // is equal to the equal chat.

      //
      if (
        data?.loggedInUserId &&
        data?.loggedInUserId === oneToOneUserId &&
        data?.otheruserId === userInfo._id
      ) {
        if (data?.clicklatestMessageId) {
          setUserClickLatestMsg({
            clicklatestMessageId: data?.clicklatestMessageId,
            clickUser: data?.loggedInUserObj,
            senderUser: data?.otherUserObj,
          });
        }
        console.log(`loggedInUserId has clicked: ${data?.loggedInUserId}`);
        console.log(data);
        //
        refetchChatUsers();
      }
    };

    // const refetchUserClick = (userId, chatId) => {
    //   if (userId && chatId) {
    //     console.log(`test click  chatId ${chatId}`);

    //     socket.emit('other_user_viewed_the_chat', {
    //       otheruserId: userId,
    //       loggedInUserId: userInfo._id,
    //       chatId: chatId,
    //     });
    //   }
    // };

    socket.on(
      'receive_other_user_viewed_the_chat',
      receiveOtherUserViewedTheChat
    );

    // Unsubscribe when the component unmounts
    return () => {
      socket.off(
        'receive_other_user_viewed_the_chat',
        receiveOtherUserViewedTheChat
      );
    };
  }, [chatUsers, oneToOneUserId, userInfo, refetchChatUsers]);

  const doesLatestMessageEqual = (latestMessageId, chatUserObjectList) => {
    // console.log(chatUserObjectList);

    // if (doesUserSendTheLatestMessage) {
    // if (refetchMessageInChat) {
    //   setUserClickLatestMsg(null);
    // }
    if (userClickLatestMsg && latestMessageId && chatUserObjectList) {
      if (chatUserObjectList._id === userClickLatestMsg.clickUser._id) {
        // return `Viewed by: ${userClickLatestMsg.clickUser.name}`;
        return `${userClickLatestMsg.clickUser.name}`;
      }
      // console.log(userClickLatestMsg);
      // return true;
    }
    // return 'nothing';
  };

  const hasOtherUserViewed = (chat) => {
    return (
      doesViewedMessageInTheChat(chat?.latestMessage) &&
      doesUserSendTheLatestMessage(chat?.latestMessage)
    );
  };

  const viewingLogic = (chat) => {
    if (
      hasOtherUserViewed(chat) &&
      doesViewedMessageInTheChat(chat?.latestMessage).name !== undefined
    ) {
      return `Viewed v1 by: ${
        doesViewedMessageInTheChat(chat?.latestMessage).name
      }`;
    } else if (
      doesLatestMessageEqual(
        chat?.latestMessage?._id,
        chatUserOneToOne(chat.users)
      )
    ) {
      return `Viewed v2 by: ${doesLatestMessageEqual(
        chat?.latestMessage?._id,
        chatUserOneToOne(chat.users)
      )}`;
    } else {
      // return 'nothing';
    }
  };


  return (
    <>
      {errorChatUsers ? (
        <Message variant="danger">
          {errorChatUsers?.data?.message || errorChatUsers.error}
        </Message>
      ) : loadingChatUsers ? (
        <Loader />
      ) : (
        <>
          <ul className="contacts">
            {chatUsers?.length > 0 &&
              chatUsers.map((chat, index) => (
                // <li key={chat._id} className="active">
                // Indicator as clicked the message user chat. changing bg-color
                <li
                  key={chat._id}
                  className={`${
                    openChatIndicator(chat._id) ? 'active' : 'non-active'
                  }`}
                >
                  <div className="d-flex bd-highlight">
                    <div className="img_cont">
                      <img
                        src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                        className="rounded-circle user_img"
                        alt="User"
                      />
                      {/* Not acurate */}
                      <span
                        className={`${
                          chatUserOneToOne(chat?.users).isLoggedIn === true
                            ? 'online_icon'
                            : 'offline_icon'
                        }`}
                      ></span>
                    </div>
                    <div className="user_info">
                      {chat?.isGroupChat ? (
                        <span>Group Chat</span>
                      ) : (
                        // If Chat is not a Group Chat
                        !chatObj?.isGroupChat && (
                          <Link
                            to={`/message/${chatUserOneToOne(chat.users)._id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            <span
                              onClick={() =>
                                refetchUserClick(
                                  chatUserOneToOne(chat?.users)._id,
                                  chat._id,
                                  chat?.latestMessage._id,
                                  chatUserOneToOne(chat?.users)
                                )
                              }
                            >
                              {chatUserOneToOne(chat?.users).name ||
                                'User not found'}
                            </span>
                          </Link>
                        )
                      )}
                      <p>
                        is {/* {status} */}
                        {chatUserOneToOne(chat?.users).isLoggedIn === true
                          ? 'online'
                          : 'offline'}
                      </p>
                      <p
                        style={{
                          fontSize: '15px',
                          color: doesReadMessageInTheChat(chat)
                            ? 'rgba(255, 255, 255, 0.6)'
                            : openChatIndicator(chat._id)
                            ? 'rgba(255, 255, 255, 0.6)'
                            : '#fff',
                        }}
                      >
                        {chat.latestMessage?.content}
                      </p>

                      {/* Check if other user viewed 
                        latest message * except for user who send the message */}

                      {/* {doesViewedMessageInTheChat(chat?.latestMessage) &&
                        doesUserSendTheLatestMessage(chat?.latestMessage) && (
                          <span style={{ fontSize: '13px' }}>
                            Viewed by:{' '}
                            {
                              doesViewedMessageInTheChat(chat?.latestMessage)
                                .name
                            }
                          </span>
                        )} */}

                      {/* {hasOtherUserViewed(chat) && (
                        <span style={{ fontSize: '13px' }}>
                          Viewed by:{' '}
                          {doesViewedMessageInTheChat(chat?.latestMessage).name}
                        </span>
                      )} */}

                      {/* {hasOtherUserViewed(chat)} */}

                      {/* <span style={{ fontSize: '13px' }}>
                        {doesLatestMessageEqual(
                          chat?.latestMessage?._id,
                          chatUserOneToOne(chat.users)
                        ) &&
                          doesLatestMessageEqual(
                            chat?.latestMessage?._id,
                            chatUserOneToOne(chat.users)
                          )}
                      </span> */}

                      {/* {userInfo} */}

                      <span style={{ fontSize: '13px' }}>
                        {viewingLogic(chat)}
                      </span>

                      {/* {doesLatestMessageEqual(
                          chat?.latestMessage?._id,
                          chatUserOneToOne(chat.users)
                        )} */}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}
      {/* <h3>Hope</h3> */}
    </>
  );
};

export default ChatUserList;
