import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../screens/message.css';

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
import { useGetAllSingleChatMessagesQuery } from '../slices/messagesApiSlice';
import { toast } from 'react-toastify';

import { Button, Form, Image, ListGroup, Modal, Nav } from 'react-bootstrap';

import Message from './Message';
import Loader from './Loader';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import ChatUserList from './ChatUserList';
import { useGetSingleUserQuery } from '../slices/usersApiSlice';
import { useDispatch } from 'react-redux';

const ChatMessages = () => {
  
  // const {
  //   data: mySingleChatMessages,
  //   refetch,
  //   isLoading,
  //   error,
  // } = useGetAllSingleChatMessagesQuery(userId);

  return (
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
              {/* <ChatUserList chatObj={mySingleChatMessages?.chat} /> */}
            </div>
            <div className="card-footer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
