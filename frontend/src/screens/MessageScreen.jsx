import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './message.css';

import {
  FaCreativeCommonsNcJp,
  FaEllipsisH,
  FaEllipsisV,
  FaHeart,
  FaPaperPlane,
  FaPaperclip,
  FaPlaneArrival,
  FaReact,
  FaRegFileImage,
  FaSearch,
  FaShare,
  FaShareAlt,
  FaSlideshare,
  FaThumbsUp,
  FaTimesCircle,
  FaTrashAlt,
  FaVideo,
} from 'react-icons/fa';
import {
  useAddMessageReactionMutation,
  useAddMessageToOneUserMutation,
  useAddReplyMessageMutation,
  useGetAllSingleChatMessagesQuery,
  useGetChatUsersQuery,
  useRemoveMessageReactionMutation,
  useUnsentMessageMutation,
  useUploadMessageImageMutation,
} from '../slices/messagesApiSlice';
import { toast } from 'react-toastify';

import { Button, Form, Image, ListGroup, Modal, Nav } from 'react-bootstrap';

import Message from '../components/Message';
import Loader from '../components/Loader';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import ChatUserList from '../components/ChatUserList';
import { useGetSingleUserQuery } from '../slices/usersApiSlice';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

const MessageScreen = () => {
  const { userInfo } = useSelector((w) => w.auth);

  const { userId } = useParams();
  const messagesRef = useRef(null);

  // If chat is not a group chat

  // console.log(userId);

  const {
    data: mySingleChatMessages,
    refetch,
    isLoading,
    error,
  } = useGetAllSingleChatMessagesQuery(userId);

  // console.log(mySingleChatMessages);

  // let {
  //   data: mySingleChatMessages,
  //   refetch,
  //   isLoading,
  //   isSuccess,
  //   isFetching,
  //   error,
  // } = useGetAllSingleChatMessagesQuery(userId, {
  //   // Use onSuccess callback to scroll to the bottom after successful data fetch
  //   onSuccess: () => {
  //     scrollToBottom();
  //   },
  // });

  // console.log(mySingleChatMessages);

  // useEffect(() => {
  //   socket.on('receive_message_chat', (data) => {
  //     // Check if user chat id is the same of opposite user message under its chat room
  //     if (data.messageObj && data.chatId === mySingleChatMessages?.chat._id) {
  //       const chatUsersInvolve = data.messageObj;

  //       //  How to make this work only if user is within the MessageScreen,jsx

  //       chatUsersInvolve.forEach((user) => {
  //         if (user._id === userInfo._id) {
  //           // console.log('Involved');
  //           refetch();
  //         } else {
  //           console.log('You`re not involved in the chat');
  //         }
  //       });
  //     }
  //   });
  //   // Scroll to the bottom when component mounts or messages update
  //   scrollToBottom();
  // }, [mySingleChatMessages, socket]);

  //  This is where if user ( From the left ) send a message to the user ( from the right)
  // Gettign the sent message will be in realtime because of refetch()

  useEffect(() => {
    //
    const receiveMessageChat = (data) => {
      // console.log(data);

      if (
        data?.latestMessageId &&
        data?.receiver === userInfo._id &&
        data?.sender?._id === userId
      ) {
        //  tads
        socket.emit('send_update_msg_sent', {
          chatId: mySingleChatMessages?.chat._id,
          sender: userInfo,
          receiver: userId,
          latestMessageId: data?.latestMessageId,
        });
      }
      if (
        data?.messageObj &&
        data?.chatId === mySingleChatMessages?.chat?._id
      ) {
        const chatUsersInvolve = data.messageObj;

        chatUsersInvolve.forEach((user) => {
          if (user._id === userInfo._id) {
            refetch();
          } else {
            // console.log('You`re not involved in the chat');
          }
        });
      }
    };

    socket.on('receive_message_chat', receiveMessageChat);

    // Unsubscribe when the component unmounts
    return () => {
      socket.off('receive_message_chat', receiveMessageChat);
    };
  }, [mySingleChatMessages, userInfo, refetch]);

  // Scroll to the bottom when component mounts or messages update
  useEffect(() => {
    scrollToBottom();
  }, [mySingleChatMessages]);
  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const [isActionMenuVisible, setActionMenuVisible] = useState(false);

  // Message toggle
  const toggleActionMenu = () => {
    setActionMenuVisible(!isActionMenuVisible);
  };

  function getTimeStamp(timestamp) {
    const date = new Date(timestamp);

    const formattedTime = new Intl.DateTimeFormat('en-PH', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);

    return formattedTime;
  }

  const [image, setImage] = useState('');

  const [showImageModal, setShowImageModal] = useState(false);

  const handleShowv2 = () => setShowImageModal(true);
  const handleClosev2 = () => setShowImageModal(false);

  const [uploadMessageImage] = useUploadMessageImageMutation();

  const [images, setImages] = useState([]);
  const [imagesDb, setImagesDb] = useState([]);

  const uploadFilesHandlerv2 = async (e) => {
    const formData = new FormData();

    const selectedImages = Array.from(e.target.files);
    setImages(selectedImages);

    // console.log(formData);
    // console.log(selectedImages);

    // Append each selected file to the FormData
    selectedImages.forEach((file, index) => {
      // console.log(file);
      // console.log(`images[${index}]`);

      // formData.append(`images[${index}]`, file);
      formData.append(`images`, file);
    });

    try {
      // Use the appropriate API endpoint for handling multiple file uploads
      const res = await uploadMessageImage(formData).unwrap();
      // Handle the response as needed
      console.log(res);
      setImagesDb(res.images);
    } catch (err) {
      // Handle errors
      console.error(err?.data?.message || err.error);
    }
  };

  const [
    addingMessageToOne,
    { isLoading: addingMessageLoading, error: addingMessageError },
  ] = useAddMessageToOneUserMutation();

  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = () => {
    // Emit a "typing" event when the user starts typing
    socket.emit('typing', { isTyping: true });
  };

  const handleBlur = () => {
    // Check if the input field is empty before emitting the "typing" event
    if (messageContent.trim() === '') {
      socket.emit('typing', { isTyping: false });
    }
  };

  useEffect(() => {
    // Listen for typing events from the sender
    socket.on('typing', ({ isTyping }) => {
      // console.log(isTyping);
      if (isTyping) {
        setIsTyping(isTyping);
      } else {
        setIsTyping(false);
      }
      // setMessageContent("typing");
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      socket.off('typing');
    };
    //
  }, [socket]);

  // socket.emit('typing', { isTyping: false });

  const [refetchMessageInChat, setRefetchMessageInChat] = useState(false);

  const addingMessageHandler = async (e, chatId) => {
    //
    e.preventDefault();

    // console.log(chatId);

    try {
      const messageCreated = await addingMessageToOne({
        content: messageContent,
        // image: image,
        // imagesUploads: images.map((file) => file.name),
        imagesUploads: imagesDb.length > 0 ? imagesDb : [],
        userId: userId,
      }).unwrap();

      if (messageCreated) {
        await refetch();
        console.log(messageCreated);
      }

      if (true) {
        socket.emit('send_message_chat', {
          messageObj: mySingleChatMessages?.chat.users,
          chatId: mySingleChatMessages?.chat._id,
          sender: userInfo,
          receiver: userId,
          latestMessageId: messageCreated?._id,
        });

        socket.emit('update_chat_messages', {
          messageObj: mySingleChatMessages?.chat.users,
          chatId: mySingleChatMessages?.chat._id,
          chat: mySingleChatMessages?.chat,
          sender: userInfo._id,
          receiver: userId,
          latestMessageId: messageCreated?._id,
        });
      }

      setRefetchMessageInChat(true);
      // console.log(addingMessageError);
      // refetch();
      toast.success('Message sent');
      setMessageContent('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [unsentMessage] = useUnsentMessageMutation();

  const removeMessage = async (messageId) => {
    if (window.confirm('You`re deleting the message!. Are you sure?')) {
      // console.log('deleted')
      try {
        await unsentMessage({ messageId });
        socket.emit('send_message_chat', {
          messageObj: mySingleChatMessages?.chat.users,
          chatId: mySingleChatMessages?.chat._id,
        });
        refetch();
        toast.success('Message successfully unsent');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const [showReactv2, setShowReactv2] = useState(null);

  const handleReactClick = (messageId) => {
    // setShowReact(!showReact);
    setShowReactv2(messageId);
    // if (messageId === showReactv2) {
    //   return true;
    // }
    // return false;

    return showReactv2;
  };

  const resetReactClick = (messageId) => {
    // setShowReact(!showReact);
    setShowReactv2(null);
    // if (messageId === showReactv2) {
    //   return true;
    // }
    // return false;
  };

  const checkMessageIsLiked = (arrayData) => {
    const hasLiked = arrayData.findIndex(
      (item) => item.user._id === userInfo._id && item.type === 'like'

      // '65753fb5778726f731e652cf' === userInfo._id && item.type === 'like'
    );

    // console.log(`hasLiked: ${hasLiked}`);
    return hasLiked;
  };

  const checkMessageIsHearted = (arrayData) => {
    const hasHearted = arrayData.findIndex(
      (item) => item.user._id === userInfo._id && item.type === 'heart'
      // (item) =>
      // '65753fb5778726f731e652cf' === userInfo._id && item.type === 'heart'
    );

    console.log(`hasHearted: ${hasHearted}`);
    return hasHearted;
  };

  const [addMessageReaction] = useAddMessageReactionMutation();

  const addReaction = async (messageId, messageReaction) => {

    // console.log(`messageReaction: ${messageReaction}`);
    // console.log(`add reaction ${messageId}`);
    try {
      const res = await addMessageReaction({
        messageId,
        messageReaction,
      }).unwrap();

      // console.log(res);

      socket.emit('send_message_chat', {
        messageObj: mySingleChatMessages?.chat.users,
        chatId: mySingleChatMessages?.chat._id,
      });
      refetch();
      toast.success(`Message successfully Reacted as ${messageReaction}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [removeMessageReaction] = useRemoveMessageReactionMutation();

  const removeReaction = async (messageId) => {
    // console.log(`remove reaction ${messageId}`);

    try {
      const res = await removeMessageReaction({ messageId }).unwrap();
      // console.log(res);
      socket.emit('send_message_chat', {
        messageObj: mySingleChatMessages?.chat.users,
        chatId: mySingleChatMessages?.chat._id,
      });
      refetch();
      // toast.success('Post successfully removed');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [replyMessageObj, setReplyMessageObj] = useState(null);

  const replyMessageHandler = async (messageObj) => {
    console.log(`messageId: ${messageObj}`);

    setReplyMessageObj(messageObj);
  };

  const resetReplyHandler = async () => {
    // console.log(`messageId: ${messageObj}`);
    setReplyMessageObj(null);
  };

  const [addReplyMessage] = useAddReplyMessageMutation();

  const addingReplyMsgHandler = async (messageObj, e) => {
    e.preventDefault();

    // console.log(`messageObj: ${messageObj._id}`);
    try {
      await addReplyMessage({
        content: messageContent,
        messageId: messageObj._id,
      });
      socket.emit('send_message_chat', {
        messageObj: mySingleChatMessages?.chat.users,
        chatId: mySingleChatMessages?.chat._id,
      });
      // console.log(addingMessageError);
      refetch();

      toast.success('Message sent');
      setMessageContent('');
      resetReplyHandler();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const getLikeCount = (arrayData) => {
    const likeCount = arrayData.filter((item) => item.type === 'like').length;
    return likeCount;
  };

  const getHeartCount = (arrayData) => {
    const heartCount = arrayData.filter((item) => item.type === 'heart').length;
    return heartCount;
  };

  const SERVER_BASE_URL = 'http://localhost:5000';
  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const { data: singleUser } = useGetSingleUserQuery({ userId });

  const [userClickLatestMsg, setUserClickLatestMsg] = useState(null);

  useEffect(() => {
    //
    // Subscribe to the 'receive_other_user_viewed_the_chat' event when the component mounts
    const receiveOtherUserViewedTheChat = (data) => {
      // Check if loggedInUserId from other Chat ( One to One )
      // is equal to the equal chat.

      if (
        data?.loggedInUserId &&
        data?.loggedInUserId === userId &&
        data?.otheruserId === userInfo._id
      ) {
        if (data?.clicklatestMessageId) {
          setUserClickLatestMsg({
            clicklatestMessageId: data?.clicklatestMessageId,
            clickUser: data?.loggedInUserObj,
            senderUser: data?.otherUserObj,
          });
        }
        console.log(`user who clicked: ${data?.loggedInUserId}`);
        //
        refetch();
      }
    };

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
  }, [mySingleChatMessages, userId, userInfo, refetch]);

  const doesLatestMessageEqual = (latestMessageId) => {
    //

    let sentStatus = '';

    if (
      userClickLatestMsg &&
      mySingleChatMessages?.chat?.latestMessage?._id === latestMessageId
    ) {
      if (
        userClickLatestMsg?.clickUser._id === userId &&
        mySingleChatMessages?.chat?.latestMessage?._id ===
          userClickLatestMsg.clicklatestMessageId
      ) {
        // console.log(
        //   `GLobal Latest Message ID: ${mySingleChatMessages?.chat?.latestMessage?._id}`
        // );
        // console.log(
        //   `${userClickLatestMsg?.clickUser?.name} has clicked the message ID ${userClickLatestMsg.clicklatestMessageId}`
        // );
        sentStatus = 'Seen';
      }
    } else {
      // continue;
    }

    //
    // if (userClickLatestMsg && latestMessageId && chatUserObjectList) {
    //   if (chatUserObjectList._id === userClickLatestMsg.clickUser._id) {
    //     return `${userClickLatestMsg.clickUser.name}`;
    //   }
    // }
    // return 'nothing';
    //
    return sentStatus;
  };

  // doesLatestMessageEqual(null, null);
  // console.log(singleUser);

  // Seen message state after the refresh ( Non Real time )
  const checkLatestMessageSeenByOtherUser = (messageId) => {
    // console.log(mySingleChatMessages?.chat?.latestMessage);
    let seenStatus = '';

    if (messageId === mySingleChatMessages?.chat?.latestMessage?._id) {
      //
      mySingleChatMessages?.chat?.latestMessage?.readBy.forEach((w) => {
        if (w.user === userId) {
          // console.log(mySingleChatMessages?.chat?.latestMessage?.content);
          seenStatus = 'Seenx';
        }
        // console.log(w._id);
      });
    }
    return seenStatus;
  };
  const [latestMsgView, setLatestMsgView] = useState(false);

  useEffect(() => {
    //
    // Subscribe to the 'receive_other_user_viewed_the_chat' event when the component mounts
    const receiveSendUpdateMsgSent = (data) => {
      // Check if loggedInUserId from other Chat ( One to One )
      // is equal to the equal chat.

      if (data?.receiver === userInfo._id && data?.sender?._id === userId) {
        console.log(`latest Message should be show as sent`);
        setLatestMsgView({
          latestMessageId: data?.latestMessageId,
        });
      }
    };

    socket.on('receive_send_update_msg_sent', receiveSendUpdateMsgSent);

    // Unsubscribe when the component unmounts
    return () => {
      socket.off('receive_send_update_msg_sent', receiveSendUpdateMsgSent);
    };
  }, [userInfo, userId]);
  const viewingLogic = (messageId) => {
    // let seenStatus = '';

    if (
      doesLatestMessageEqual(messageId) ||
      latestMsgView?.latestMessageId === messageId
    ) {
      return 'v2 Seen';
      /* <span>{sentStatus && sentStatus}</span> */
    }

    if (checkLatestMessageSeenByOtherUser(messageId)) {
      return 'v1 Seen';
      /* <span className="">
      {checkLatestMessageSeenByOtherUser(w._id)}
    </span> */
    }
    // {doesLatestMessageEqual(w._id)}
    // return seenStatus;
  };

  return (
    <>
      {error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="container-fluid h-100 message_body">
            <div className="row justify-content-center h-100">
              {/*  */}
              <div className="col-md-4 col-xl-3 chat">
                <div className="card card-m mb-sm-3 mb-md-0 contacts_card">
                  <div className="card-header">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Search..."
                        name=""
                        className="form-control search"
                      />
                      <div className="input-group-prepend">
                        <span
                          style={{ height: '100%' }}
                          className="input-group-text search_btn"
                        >
                          {/* <i className="fas fa-search"></i> */}
                          <FaSearch />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-body contacts_body">
                    <ChatUserList
                      chatObj={mySingleChatMessages?.chat}
                      refetchMessageInChat={refetchMessageInChat}
                      oneToOneUserId={userId}
                    />
                  </div>
                  <div className="card-footer"></div>
                </div>
              </div>

              {/* Chat Right Side */}
              <div className="col-md-8 col-xl-6 chat">
                <div className="card card-m">
                  <div className="card-header msg_head">
                    <div className="d-flex bd-highlight">
                      <div className="img_cont">
                        <img
                          src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                          className="rounded-circle user_img"
                          alt="User"
                        />
                        <span className="online_icon"></span>
                      </div>
                      <div className="user_info">
                        <span>Chat with {singleUser?.name}</span>
                        <p>1767 Messages </p>
                      </div>
                      <div className="video_cam">
                        <span>
                          <i className="fas fa-video"></i>
                        </span>
                        <span>
                          <i className="fas fa-phone"></i>
                        </span>
                      </div>
                    </div>
                    <span onClick={toggleActionMenu} id="action_menu_btn">
                      {/* $(document).ready(function(){
                        $('#action_menu_btn').click(function(){
                          $('.action_menu').toggle();
                        });
                      }); */}
                      <FaEllipsisV />
                    </span>

                    {isActionMenuVisible && (
                      <div className="action_menu">
                        <ul>
                          <li>
                            <i className="fas fa-user-circle"></i> View profile
                          </li>
                          <li>
                            <i className="fas fa-users"></i> Add to close
                            friends
                          </li>
                          <li>
                            <i className="fas fa-plus"></i> Add to group
                          </li>
                          <li>
                            <i className="fas fa-ban"></i> Block
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* Below are start of Messages.  */}

                  <div className="card-body msg_card_body" ref={messagesRef}>
                    {mySingleChatMessages &&
                      mySingleChatMessages?.messages?.map((w) => {
                        return w.sender?._id === userInfo._id ? (
                          <div key={w._id}>
                            {/*  */}
                            {w.replyingTo && (
                              <div
                                style={{
                                  // marginRight: '106px',
                                  marginLeft: '270px',
                                  maxWidth: '200px',
                                  maxHeight: '120px',
                                }}
                              >
                                <span style={{ fontSize: '12px' }}>
                                  You replied to {w.replyingTo?.sender.name}
                                </span>
                                {/* I want to develop a consistent system to
                                        do hard habits without everyone. I want
                                        to develop a consistent system to do
                                        hard habits without everyone */}

                                <div className="msg_cotainer_send msg_cotainer_send_ellipsis">
                                  {w.replyingTo?.content}
                                </div>
                              </div>
                            )}

                            {!w.isUnsent && (
                              <div
                                style={{
                                  marginLeft: '330px',
                                  marginBottom: '7px',
                                }}
                              >
                                <span
                                  title="Reply"
                                  onClick={() => replyMessageHandler(w)}
                                  style={{
                                    marginRight: '5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaShare />
                                </span>

                                <span
                                  title="React"
                                  style={{
                                    marginRight: '5px',
                                    cursor: 'pointer',
                                  }}
                                  onClick={
                                    showReactv2 !== w._id
                                      ? // Set w._id into showReactv2
                                        () => handleReactClick(w._id)
                                      : // showReactv2 into null
                                        () => resetReactClick()
                                  }
                                >
                                  <FaCreativeCommonsNcJp />
                                </span>

                                <span
                                  title="Remove message"
                                  onClick={() => removeMessage(w._id)}
                                  style={{
                                    marginRight: '5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaTrashAlt />
                                </span>

                                {w.images.length > 0 && (
                                  <span
                                    title="View image"
                                    onClick={() => removeMessage(w._id)}
                                    style={{
                                      marginRight: '5px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <FaRegFileImage />
                                  </span>
                                )}
                              </div>
                            )}

                            {showReactv2 === w._id && (
                              <div
                                style={{
                                  marginLeft: '250px',
                                  marginBottom: '10px',
                                }}
                              >
                                <span style={{ marginRight: '5px' }}>
                                  <FaThumbsUp
                                    style={{
                                      cursor: 'pointer',
                                      color:
                                        checkMessageIsLiked(w.reaction) === -1
                                          ? ''
                                          : '#1877f2',
                                    }}
                                    // style={{ color: '#1877f2' }}
                                    // onClick={() => addReaction(w._id, 'like')}
                                    onClick={
                                      checkMessageIsLiked(w.reaction) === -1
                                        ? () => addReaction(w._id, 'like')
                                        : () => removeReaction(w._id)
                                    }
                                  />
                                </span>

                                <span
                                  style={{
                                    cursor: 'pointer',
                                    marginRight: '5px',
                                  }}
                                  onClick={
                                    checkMessageIsHearted(w.reaction) === -1
                                      ? () => addReaction(w._id, 'heart')
                                      : () => removeReaction(w._id)
                                  }
                                >
                                  <FaHeart
                                    style={{
                                      color:
                                        checkMessageIsHearted(w.reaction) === -1
                                          ? ''
                                          : 'red',
                                    }}
                                  />
                                </span>
                              </div>
                            )}

                            <div className="d-flex justify-content-end mb-4">
                              {w.isUnsent ? (
                                <>
                                  <div
                                    style={{ backgroundColor: '#1877f2' }}
                                    className="msg_cotainer_send"
                                  >
                                    You unsent a message
                                    <span className="msg_time">
                                      {getTimeStamp(w.createdAt)}
                                    </span>
                                  </div>

                                  <div className="img_cont_msg">
                                    <img
                                      style={{
                                        height: '40px',
                                        width: '40px',
                                      }}
                                      src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                                      className="rounded-circle user_img"
                                      alt="User"
                                    />
                                  </div>
                                </>
                              ) : (
                                //
                                <>
                                  <div style={{ marginRight: '32px' }}>
                                    {/* <span className="">Seendi</span> */}

                                    {/* <span className="">
                                      {checkLatestMessageSeenByOtherUser(w._id)}
                                    </span> */}

                                    {/* <span>{sentStatus && sentStatus}</span> */}
                                    {/* {doesLatestMessageEqual(w._id)} */}
                                    {viewingLogic(w._id)}
                                  </div>
                                  <div className="msg_cotainer_send">
                                    {w.content}
                                    <span className="msg_time_send">
                                      {getTimeStamp(w.createdAt)}, Todayc
                                    </span>

                                    {getLikeCount(w.reaction) > 0 && (
                                      <span className="msg_time_message_icon_like">
                                        <FaThumbsUp
                                          style={{ color: '#1877f2' }}
                                        />
                                      </span>
                                    )}

                                    {getHeartCount(w.reaction) > 0 && (
                                      <span className="msg_time_message_icon_heart">
                                        <FaHeart style={{ color: 'red' }} />
                                      </span>
                                    )}

                                    <span className="msg_time_message_icon_count">
                                      {w.reaction.length > 0 &&
                                        w.reaction.length}
                                    </span>
                                  </div>

                                  {/*  */}

                                  {w.images.length > 0 && (
                                    <div>
                                      {w.images.map((image, index) => (
                                        <img
                                          key={index}
                                          title="View image"
                                          style={{
                                            height: '40px',
                                            width: '40px',
                                            cursor: 'pointer',
                                          }}
                                          // src={`${image}`}
                                          src={`${SERVER_BASE_URL}${image.replace(
                                            /\\/g,
                                            '/'
                                          )}`}
                                          className="rounded-circle user_img"
                                          alt={`Uploaded Image ${index + 1}`}
                                          onClick={() =>
                                            openImageInNewTab(
                                              `${SERVER_BASE_URL}${image.replace(
                                                /\\/g,
                                                '/'
                                              )}`
                                            )
                                          }
                                        />
                                      ))}
                                    </div>
                                  )}

                                  <div className="img_cont_msg">
                                    <img
                                      style={{
                                        height: '40px',
                                        width: '40px',
                                      }}
                                      src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                                      className="rounded-circle user_img"
                                      alt="User"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          // {true ? (<></>) : (<></>)}
                          //
                          <div key={w._id}>
                            {' '}
                            {showReactv2 === w._id && (
                              <div
                                style={{
                                  marginLeft: '55px',
                                  marginBottom: '10px',
                                }}
                              >
                                <span style={{ marginRight: '5px' }}>
                                  <FaThumbsUp
                                    style={{
                                      cursor: 'pointer',
                                      color:
                                        checkMessageIsLiked(w.reaction) === -1
                                          ? ''
                                          : '#1877f2',
                                    }}
                                    // style={{ color: '#1877f2' }}
                                    // onClick={() => addReaction(w._id, 'like')}
                                    onClick={
                                      checkMessageIsLiked(w.reaction) === -1
                                        ? () => addReaction(w._id, 'like')
                                        : () => removeReaction(w._id)
                                    }
                                  />
                                </span>

                                <span
                                  style={{
                                    cursor: 'pointer',
                                    marginRight: '5px',
                                  }}
                                  onClick={
                                    checkMessageIsHearted(w.reaction) === -1
                                      ? () => addReaction(w._id, 'heart')
                                      : () => removeReaction(w._id)
                                  }
                                >
                                  <FaHeart
                                    style={{
                                      color:
                                        checkMessageIsHearted(w.reaction) === -1
                                          ? ''
                                          : 'red',
                                    }}
                                  />
                                </span>
                              </div>
                            )}
                            <div
                              style={{
                                marginLeft: '55px',
                                marginBottom: '5px',
                              }}
                            >
                              {w.replyingTo && (
                                <div
                                  style={{
                                    marginRight: '106px',
                                    maxWidth: '200px',
                                    maxHeight: '120px',
                                  }}
                                >
                                  <span style={{ fontSize: '12px' }}>
                                    You replied to {w.replyingTo.sender.name}
                                  </span>
                                  {/* I want to develop a consistent system to
                                        do hard habits without everyone. I want
                                        to develop a consistent system to do
                                        hard habits without everyone */}

                                  <div className="msg_cotainer_send msg_cotainer_send_ellipsis">
                                    {w.replyingTo.content}
                                  </div>
                                </div>
                              )}

                              {/*  */}

                              {!w.isUnsent && (
                                <div>
                                  <span
                                    title="Reply"
                                    onClick={() => replyMessageHandler(w)}
                                    style={{
                                      marginRight: '5px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <FaShare />
                                  </span>

                                  <span
                                    title="React"
                                    style={{
                                      marginRight: '5px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={
                                      showReactv2 !== w._id
                                        ? // Set w._id into showReactv2
                                          () => handleReactClick(w._id)
                                        : // showReactv2 into null
                                          () => resetReactClick()
                                    }
                                  >
                                    <FaCreativeCommonsNcJp />
                                  </span>
                                  {w.images.length > 0 && (
                                    <span
                                      title="View image"
                                      onClick={() => removeMessage(w._id)}
                                      style={{
                                        marginRight: '5px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <FaRegFileImage />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="d-flex justify-content-start mb-4">
                              {w.isUnsent ? (
                                <>
                                  <div className="img_cont_msg">
                                    <img
                                      style={{
                                        height: '40px',
                                        width: '40px',
                                      }}
                                      src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                                      className="rounded-circle user_img"
                                      alt="User"
                                    />
                                  </div>
                                  <div className="msg_cotainer">
                                    {w.sender.name} unsent a message
                                    <span className="msg_time">
                                      {getTimeStamp(w.createdAt)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="img_cont_msg">
                                    <img
                                      style={{
                                        height: '40px',
                                        width: '40px',
                                      }}
                                      src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                                      className="rounded-circle user_img"
                                      alt="User"
                                    />
                                  </div>
                                  <div className="msg_cotainer">
                                    {w.content}

                                    <span className="msg_time_left">
                                      {getTimeStamp(w.createdAt)}, Today
                                    </span>

                                    {getLikeCount(w.reaction) > 0 && (
                                      <span className="msg_time_message_icon_like_left">
                                        <FaThumbsUp
                                          style={{ color: '#1877f2' }}
                                        />
                                      </span>
                                    )}

                                    {getHeartCount(w.reaction) > 0 && (
                                      <span className="msg_time_message_icon_heart_left">
                                        <FaHeart style={{ color: 'red' }} />
                                      </span>
                                    )}
                                    <span className="msg_time_message_icon_count_left">
                                      {w.reaction.length > 0 &&
                                        w.reaction.length}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="card-footer">
                    {/* {messageContent !== '' && (
                      <span>Someone is typing... {messageContent}</span>
                    )} */}
                    {/* {messageContent && <span>Someone is typing...</span>} */}
                    {isTyping && <span>Someone is typing...</span>}
                    <Form
                      onSubmit={
                        replyMessageObj
                          ? (e) => addingReplyMsgHandler(replyMessageObj, e)
                          : (e) =>
                              addingMessageHandler(
                                e,
                                mySingleChatMessages?.chat?._id
                              )
                      }
                    >
                      {replyMessageObj && (
                        //
                        <div className="replyToContainer">
                          <div className="replyingToUserName">
                            <span>
                              Replying to {replyMessageObj.sender.name}
                            </span>

                            <span
                              title="Close"
                              className="replyingToUserRemoval"
                              onClick={resetReplyHandler}
                              style={{ cursor: 'pointer' }}
                            >
                              <FaTimesCircle />
                            </span>
                          </div>

                          <div className="replyingToUserMessage">
                            <p>{replyMessageObj.content}</p>
                          </div>
                        </div>
                        //
                      )}

                      <div className="input-group">
                        <div className="input-group-append">
                          <span
                            title="Upload image"
                            style={{ height: '100%' }}
                            className="input-group-text attach_btn"
                            onClick={handleShowv2}
                          >
                            <FaPaperclip />
                          </span>
                        </div>
                        <Modal show={showImageModal} onHide={handleClosev2}>
                          <Modal.Header closeButton>
                            <Modal.Title>Upload Image</Modal.Title>
                          </Modal.Header>

                          <Modal.Body>
                            {/* <Form.Group controlId="image">
                              <Image src={image} alt={'Post Image'} fluid />
                              <Form.Control
                                type="text"
                                placeholder="Enter image url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                              ></Form.Control>
                              <Form.Control
                                label="Choose File"
                                onChange={uploadFileHandler}
                                type="file"
                                accept="image/*"
                              ></Form.Control>
                            </Form.Group>
                             */}

                            {/* BAESIS  */}

                            <Form.Group controlId="images">
                              <Form.Control
                                label="Choose Files"
                                onChange={uploadFilesHandlerv2}
                                type="file"
                                accept="image/*"
                                multiple
                              />
                            </Form.Group>

                            {/* <Form.Group controlId="images">
                              {imageUrls.map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Image ${index + 1}`}
                                  style={{
                                    maxWidth: '100px',
                                    maxHeight: '100px',
                                    marginRight: '10px',
                                  }}
                                />
                              ))}
                              <Form.Control
                                label="Choose File"
                                onChange={handleImageChange}
                                type="file"
                                accept="image/*"
                                multiple
                              ></Form.Control>
                             
                            </Form.Group> */}
                          </Modal.Body>
                        </Modal>

                        <Form.Control
                          className="form-control type_msg"
                          as="textarea"
                          placeholder="Type your message..."
                          row="2"
                          required
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          onKeyPress={handleTyping}
                          onBlur={handleBlur} // Add onBlur event to handle when the input loses focus
                        ></Form.Control>
                        <div className="input-group-append">
                          <Button
                            title="Send message"
                            style={{ height: '100%', cursor: 'pointer' }}
                            className="input-group-text send_btn"
                            type="submit"
                            disabled={messageContent === ''}
                          >
                            {/* <span className="input-group-text send_btn"> */}
                            <FaPaperPlane />
                            {/* </span> */}
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessageScreen;
