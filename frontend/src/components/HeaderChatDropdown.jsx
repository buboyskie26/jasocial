import React, { useEffect } from 'react';
import { useGetChatUsersQuery } from '../slices/messagesApiSlice';
import { Badge, Dropdown } from 'react-bootstrap';
import { FaFacebookMessenger } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
const socket = io('http://localhost:5000'); // Replace with your server URL

const HeaderChatDropdown = () => {
  const {
    data: chatUsers,
    refetch: refetchChatUsers,
    isLoading: loadingChatUsers,
    error: errorChatUsers,
  } = useGetChatUsersQuery();

//   console.log(chatUsers);

  const { userInfo } = useSelector((w) => w.auth);
  let loggedInUserId = userInfo?._id;

  const chatUserOneToOne = (users) => {
    const userObj = users.find((user) => user._id !== userInfo._id);
    return userObj || {};
  };

  const openChatIndicator = (selectedChatId) => {
    // const doesSelectedChat =
    //   chatUsers?.findIndex((w) => w._id === chatObj?._id) !== -1;
    const doesSelectedChat = selectedChatId === chatObj?._id;
    return doesSelectedChat;
  };

  const doesReadMessageInTheChat = (selectedChat) => {
    const doesSelectedChat =
      selectedChat?.latestMessage?.readBy.findIndex(
        (w) => w.user === userInfo._id
      ) !== -1;
    return doesSelectedChat;
  };

  useEffect(() => {
    // Subscribe to the 'receive_chat_messages' event when the component mounts
    const receiveMessageHandler = (data) => {
      if (
        data?.messageObj &&
        chatUsers?.findIndex((w) => w._id === data?.chatId) !== -1
      ) {
        const chatUsersInvolve = data.messageObj;
        chatUsersInvolve.forEach((user) => {
          if (user._id === userInfo._id) {
            refetchChatUsers();
          } else {
            // console.log('You`re not involved in the chat');
          }
        });
      }

      // console.log('recevied_update_chat');
      // refetchChatUsers();
    };

    socket.on('receive_chat_messages', receiveMessageHandler);

    // Unsubscribe when the component unmounts
    return () => {
      socket.off('receive_chat_messages', receiveMessageHandler);
    };
  }, [chatUsers, userInfo, refetchChatUsers]);

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

  const chatObj = {};

  return (
    <Dropdown drop="start">
      <Dropdown.Toggle variant="link" id="dropdown-messages">
        <FaFacebookMessenger />
        <Badge pill bg="success" style={{ marginLeft: '5px' }}></Badge>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '350px' }}>
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
                      <Link
                        to={`/message/${chatUserOneToOne(chat.users)._id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <span>
                          {chatUserOneToOne(chat?.users).name ||
                            'User not found'}
                        </span>
                      </Link>
                    )}
                    <p>
                      is {/* {status} */}
                      {chatUserOneToOne(chat?.users).isLoggedIn === true
                        ? 'online'
                        : 'offline'}
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                          color: doesReadMessageInTheChat(chat)
                            ? 'rgba(255, 255, 255, 0.6)'
                            : openChatIndicator(chat._id)
                            ? 'rgba(255, 255, 255, 0.6)'
                            : '#fff',
                      }}
                    >
                      {chat.latestMessage?.content}
                      {/* Content Message */}
                    </p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HeaderChatDropdown;
