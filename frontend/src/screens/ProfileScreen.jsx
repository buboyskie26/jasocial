import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './post_image.css';
import { useGetSingleProfileQuery } from '../slices/usersApiSlice';
import { Image, ListGroup } from 'react-bootstrap';
import {
  FaHeart,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaEdit,
  FaRegTimesCircle,
  FaUserEdit,
  FaFacebookMessenger,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import {
  useAddPostLikeMutation,
  useDeletePostLikeMutation,
  useDeletePostMutation,
  useSharePostMutation,
  useSharingASharedPostMutation,
} from '../slices/postsApiSlice';
import { toast } from 'react-toastify';
import SharingSharedPost from '../components/SharingSharedPost';
import SharingPost from '../components/SharingPost';
import PostEdit from '../components/PostEdit';
import { useAddChatToUserMutation } from '../slices/messagesApiSlice';

const ProfileScreen = () => {
  const { userId } = useParams();

  const {
    data: profilePost,
    refetch,
    isLoading,
    error,
  } = useGetSingleProfileQuery({ userId });

  // console.log(profilePost);

  const { userInfo } = useSelector((w) => w.auth);

  function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
      if (elapsed / 1000 < 30) return 'Just now';

      return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  }

  const [
    addPostLike,
    // { isLoading: addPostLoadingLike, error: addPostErrorLike },
  ] = useAddPostLikeMutation();

  const [deletePostLike] = useDeletePostLikeMutation();

  const addReaction = async (postId, type) => {
    // console.log(`postId ${postId}`);
    // console.log(`add reaction ${postId}`);

    try {
      const res = await addPostLike({ postId, type }).unwrap();
      // console.log(res);
      refetch();
      // toast.success('Post successfully removed');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    //
  };

  const removeReaction = async (postId) => {
    // console.log(`remove reaction ${postId}`);

    try {
      const res = await deletePostLike({ postId }).unwrap();
      // console.log(res);
      refetch();
      // toast.success('Post successfully removed');
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

  const checkPostIsLiked = (arrayData) => {
    const hasLiked = arrayData.findIndex(
      (item) => item.user._id === userInfo._id && item.type === 'like'
    );

    // console.log(hasLiked);
    return hasLiked;
  };
  const checkPostIsHearted = (arrayData) => {
    const hasHearted = arrayData.findIndex(
      (item) => item.user._id === userInfo._id && item.type === 'heart'
    );

    return hasHearted;
  };

  // Sharing a Shared Post

  const [storedSharedPost, setStoredSharedPost] = useState(null);

  const [sharingSharedPost] = useSharingASharedPostMutation();

  const [showSharedSharePostModal, setShowSharedSharePostModal] =
    useState(false);

  //
  const handleShareSharedPostShow = (sharePost) => {
    // console.log(sharePost.postShared);
    setStoredSharedPost(sharePost.postShared);
    setShowSharedSharePostModal(true);
  };

  //  console.log(selectedSamples)

  const handleShareSharedPostClose = () => {
    setStoredSharedPost(null);
    setShowSharedSharePostModal(false);
  };

  const [sharePost] = useSharePostMutation();
  const [showSharePostModal, setShowSharePostModal] = useState(false);
  const [storedPost, setStoredPost] = useState(null);

  //
  const handleSharePostShow = (post) => {
    const { postedBy, content, createdAt, _id } = post;
    setStoredPost(post);
    setShowSharePostModal(true);
    // console.log(post);
  };

  const handleSharePostClose = () => {
    setStoredPost(null);
    setShowSharePostModal(false);
  };

  // Post Remove

  const [deletePost] = useDeletePostMutation();
  const deletePostContent = async (postId) => {
    // console.log(`postId: ${postId}`);

    if (window.confirm('You`re deleting the post!. Are you sure?')) {
      try {
        await deletePost({ postId });
        refetch();
        toast.success('Post successfully removed');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // Post Edit
  const [postContent, setPostContent] = useState('');
  const [postId, setPostId] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const handlePostEdit = (post) => {
    setShowModal(true);
    setPostContent(post.content);
    setPostId(post._id);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const navigate = useNavigate();

  const [addUserChat] = useAddChatToUserMutation();

  // const initializedChatUser = async () => {
  //   //
  //   console.log('click initializedChatUser');
  //   const res = await addUserChat({ userId: userId }).unwrap();

  //   if (res) {
  //     console.log(res);
  //     navigate(`/message/${userId}`);
  //     //
  //   }
  // };
  const [initChatRefresh, setInitChatRefresh] = useState(false);

  const initializedChatUser = async () => {
    //
    // console.log('click initializedChatUser');

    try {
      const res = await addUserChat({ userId: userId });
      const data = res.data; // Adjust this based on your server response structure

      if (res.error) {
        // if (data.error) {
        console.log('error');
      } else {
        
        console.log(res);
        setInitChatRefresh(true);
        
        navigate(`/message/${userId}`);
      }
    } catch (error) {
      // console.error('Error adding user chat:', error);
      // Handle error appropriately
    }
  };

  //
  return (
    <div>
      <div className="container">
        <div className="profile-page tx-13">
          <div className="row">
            <div className="col-lg-12 grid-margin">
              <div className="profile-header">
                <div className="cover">
                  <div className="gray-shade"></div>
                  <figure>
                    <img
                      src="https://bootdey.com/img/Content/bg1.jpg"
                      className="img-fluid"
                      alt="profile cover"
                    />
                  </figure>
                  <div className="cover-body d-flex justify-content-between align-items-center">
                    <div>
                      <img
                        className="profile-pic"
                        src="https://bootdey.com/img/Content/avatar/avatar6.png"
                        alt="profile"
                      />
                      <span className="profile-name">Amiah Burton</span>
                    </div>
                    <div className="d-none d-md-block">
                      <button className="btn btn-info btn-icon-text btn-edit-profile">
                        <FaUserEdit /> Edit profile
                      </button>

                      {/* <Link to={`/message/${userId}`}> */}
                      <button
                        onClick={initializedChatUser}
                        style={{ marginLeft: '7px' }}
                        className="btn btn-primary btn-icon-text btn-edit-profile"
                      >
                        <FaFacebookMessenger /> Message
                      </button>
                      {/* </Link> */}
                    </div>
                  </div>
                </div>

                <div class="header-links">
                  <ul class="links d-flex align-items-center mt-3 mt-md-0">
                    <li class="header-link-item d-flex align-items-center active">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-columns mr-1 icon-md"
                      >
                        {' '}
                        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path>{' '}
                      </svg>{' '}
                      <a class="pt-1px d-none d-md-block" href="#">
                        Timeline
                      </a>
                    </li>
                    <li class="header-link-item ml-3 pl-3 border-left d-flex align-items-center">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-user mr-1 icon-md"
                      >
                        {' '}
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>{' '}
                        <circle cx="12" cy="7" r="4"></circle>{' '}
                      </svg>{' '}
                      <a class="pt-1px d-none d-md-block" href="#">
                        About
                      </a>
                    </li>
                    <li class="header-link-item ml-3 pl-3 border-left d-flex align-items-center">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-users mr-1 icon-md"
                      >
                        {' '}
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>{' '}
                        <circle cx="9" cy="7" r="4"></circle>{' '}
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>{' '}
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>{' '}
                      </svg>{' '}
                      <a class="pt-1px d-none d-md-block" href="#">
                        Friends <span class="text-muted tx-12">3,765</span>
                      </a>
                    </li>
                    <li class="header-link-item ml-3 pl-3 border-left d-flex align-items-center">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-image mr-1 icon-md"
                      >
                        {' '}
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>{' '}
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>{' '}
                        <polyline points="21 15 16 10 5 21"></polyline>{' '}
                      </svg>{' '}
                      <a class="pt-1px d-none d-md-block" href="#">
                        Photos
                      </a>
                    </li>
                    <li class="header-link-item ml-3 pl-3 border-left d-flex align-items-center">
                      {' '}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-video mr-1 icon-md"
                      >
                        {' '}
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>{' '}
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>{' '}
                      </svg>{' '}
                      <a class="pt-1px d-none d-md-block" href="#">
                        Videos
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="row profile-body">
              {/* LEFT  */}
              <div class="d-none d-md-block col-md-4 col-xl-3 left-wrapper">
                <div class="card rounded">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h6 class="card-title mb-0">About</h6>
                      <div class="dropdown">
                        {' '}
                        <button
                          class="btn p-0"
                          type="button"
                          id="dropdownMenuButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          {' '}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="feather feather-more-horizontal icon-lg text-muted pb-3px"
                          >
                            {' '}
                            <circle cx="12" cy="12" r="1"></circle>{' '}
                            <circle cx="19" cy="12" r="1"></circle>{' '}
                            <circle cx="5" cy="12" r="1"></circle>{' '}
                          </svg>{' '}
                        </button>
                        <div
                          class="dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
                        >
                          {' '}
                          <a
                            class="dropdown-item d-flex align-items-center"
                            href="#"
                          >
                            {' '}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="feather feather-edit-2 icon-sm mr-2"
                            >
                              {' '}
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>{' '}
                            </svg>{' '}
                            <span class="">Edit</span>
                          </a>{' '}
                          <a
                            class="dropdown-item d-flex align-items-center"
                            href="#"
                          >
                            {' '}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="feather feather-git-branch icon-sm mr-2"
                            >
                              {' '}
                              <line x1="6" y1="3" x2="6" y2="15"></line>{' '}
                              <circle cx="18" cy="6" r="3"></circle>{' '}
                              <circle cx="6" cy="18" r="3"></circle>{' '}
                              <path d="M18 9a9 9 0 0 1-9 9"></path>{' '}
                            </svg>{' '}
                            <span class="">Update</span>
                          </a>{' '}
                          <a
                            class="dropdown-item d-flex align-items-center"
                            href="#"
                          >
                            {' '}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="feather feather-eye icon-sm mr-2"
                            >
                              {' '}
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>{' '}
                              <circle cx="12" cy="12" r="3"></circle>{' '}
                            </svg>{' '}
                            <span class="">View all</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <p>
                      Hi! I'm Amiah the Senior UI Designer at Vibrant. We hope
                      you enjoy the design and quality of Social.
                    </p>
                    <div class="mt-3">
                      {' '}
                      <label class="tx-11 font-weight-bold mb-0 text-uppercase">
                        Joined:
                      </label>
                      <p class="text-muted">November 15, 2015</p>
                    </div>
                    <div class="mt-3">
                      {' '}
                      <label class="tx-11 font-weight-bold mb-0 text-uppercase">
                        Lives:
                      </label>
                      <p class="text-muted">New York, USA</p>
                    </div>
                    <div class="mt-3">
                      {' '}
                      <label class="tx-11 font-weight-bold mb-0 text-uppercase">
                        Email:
                      </label>
                      <p class="text-muted">me@nobleui.com</p>
                    </div>
                    <div class="mt-3">
                      {' '}
                      <label class="tx-11 font-weight-bold mb-0 text-uppercase">
                        Website:
                      </label>
                      <p class="text-muted">www.nobleui.com</p>
                    </div>
                    <div class="mt-3 d-flex social-links">
                      {' '}
                      <a class="btn d-flex align-items-center justify-content-center border mr-2 btn-icon github">
                        {' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="feather feather-github"
                          data-toggle="tooltip"
                          title=""
                          data-original-title="github.com/nobleui"
                        >
                          {' '}
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>{' '}
                        </svg>{' '}
                      </a>{' '}
                      <a class="btn d-flex align-items-center justify-content-center border mr-2 btn-icon twitter">
                        {' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="feather feather-twitter"
                          data-toggle="tooltip"
                          title=""
                          data-original-title="twitter.com/nobleui"
                        >
                          {' '}
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>{' '}
                        </svg>{' '}
                      </a>{' '}
                      <a class="btn d-flex align-items-center justify-content-center border mr-2 btn-icon instagram">
                        {' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="feather feather-instagram"
                          data-toggle="tooltip"
                          title=""
                          data-original-title="instagram.com/nobleui"
                        >
                          {' '}
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            ry="5"
                          ></rect>{' '}
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>{' '}
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>{' '}
                        </svg>{' '}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-8 col-xl-6 middle-wrapper">
                <div className="row">
                  {/* WITH IMAGES */}
                  {/* <div className="col-md-12 grid-margin">
                    <div className="card rounded">
                      <div className="card-header">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <img
                              className="img-xs rounded-circle"
                              src="https://bootdey.com/img/Content/avatar/avatar6.png"
                              alt=""
                            />
                            <div className="ml-2">
                              <p>Mike Popescu</p>
                              <p className="tx-11 text-muted">1 min ago</p>
                            </div>
                          </div>
                          <div className="dropdown">
                            <button
                              className="btn p-0"
                              type="button"
                              id="dropdownMenuButton2"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="feather feather-more-horizontal icon-lg pb-3px"
                              >
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                              </svg>
                            </button>
                            <div
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuButton2"
                            >
                              <a
                                className="dropdown-item d-flex align-items-center"
                                href="#"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="feather feather-meh icon-sm mr-2"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="8" y1="15" x2="16" y2="15"></line>
                                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                                <span className="">Unfollow</span>
                              </a>
                              <a
                                className="dropdown-item d-flex align-items-center"
                                href="#"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="feather feather-corner-right-up icon-sm mr-2"
                                >
                                  <polyline points="10 9 15 4 20 9"></polyline>
                                  <path d="M4 20h7a4 4 0 0 0 4-4V4"></path>
                                </svg>
                                <span className="">Go to post</span>
                              </a>
                              <a
                                className="dropdown-item d-flex align-items-center"
                                href="#"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="feather feather-share-2 icon-sm mr-2"
                                >
                                  <circle cx="18" cy="5" r="3"></circle>
                                  <circle cx="6" cy="12" r="3"></circle>
                                  <circle cx="18" cy="19" r="3"></circle>
                                  <line
                                    x1="8.59"
                                    y1="13.51"
                                    x2="15.42"
                                    y2="17.49"
                                  ></line>
                                  <line
                                    x1="15.41"
                                    y1="6.51"
                                    x2="8.59"
                                    y2="10.49"
                                  ></line>
                                </svg>
                                <span className="">Share</span>
                              </a>
                              <a
                                className="dropdown-item d-flex align-items-center"
                                href="#"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  className="feather feather-copy icon-sm mr-2"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                <span className="">Copy link</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="mb-3 tx-14">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Accusamus minima delectus nemo unde quae
                          recusandae assumenda.
                        </p>
                        <img
                          className="img-fluid"
                          src="https://bootdey.com/img/Content/avatar/avatar6.png"
                          alt=""
                        />
                      </div>
                      <div className="card-footer">
                        <div className="d-flex post-actions">
                          <a
                           
                            className="d-flex align-items-center text-muted mr-4"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="feather feather-heart icon-md"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <p className="d-none d-md-block ml-2">Like</p>
                          </a>
                          <a
                           
                            className="d-flex align-items-center text-muted mr-4"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="feather feather-message-square icon-md"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <p className="d-none d-md-block ml-2">Comment</p>
                          </a>
                          <a
                           
                            className="d-flex align-items-center text-muted"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="feather feather-share icon-md"
                            >
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            <p className="d-none d-md-block ml-2">Share</p>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {profilePost?.length > 0 &&
                    profilePost?.map((post) => (
                      <div key={post._id} className="col-md-12">
                        <div className="d-flex flex-column border-bottom pb-1 comment-section">
                          <div className="bg-white p-2">
                            {post?.sharePost && (
                              <span>
                                <span
                                  style={{ marginRight: '10px' }}
                                  className="badge bg-primary px-2 py-1 shadow-1-strong mb-3"
                                >
                                  Shared Post
                                </span>
                              </span>
                            )}

                            <span className="badge bg-primary px-2 py-1 shadow-1-strong mb-3">
                              <Link to={`/${post._id}`} className="nav-link">
                                View Post
                              </Link>
                            </span>

                            {post.postedBy._id === userInfo._id && (
                              <span style={{ marginLeft: '160px' }}>
                                <span
                                  style={{
                                    marginLeft: '200px',
                                    cursor: 'pointer',
                                  }}
                                  className="mb-1 ml-2"
                                >
                                  <FaEdit
                                    className="text-primary"
                                    onClick={() => handlePostEdit(post)}
                                  />
                                </span>
                                <PostEdit
                                  postContent={postContent}
                                  postId={postId}
                                  setPostContent={setPostContent}
                                  setShowModal={setShowModal}
                                  refetch={refetch}
                                  showModal={showModal}
                                  handleCloseModal={handleCloseModal}
                                />
                                <span
                                  style={{
                                    marginLeft: '10px',
                                    cursor: 'pointer',
                                  }}
                                  className="mb-1 ml-2"
                                >
                                  <FaRegTimesCircle
                                    style={{ color: 'red' }}
                                    onClick={() => deletePostContent(post._id)}
                                  />
                                </span>
                              </span>
                            )}

                            {post?.sharePost !== undefined ? (
                              <ListGroup>
                                <div className="d-flex flex-row user-info">
                                  <img
                                    style={{ marginRight: '10px' }}
                                    className="rounded-circle"
                                    src="https://i.imgur.com/RpzrMR2.jpg"
                                    width="40"
                                    alt="User"
                                  />
                                  <div className="d-flex flex-column justify-content-start ml-2">
                                    {/* <Link to={`/profile/${post.postedBy._id}`}> */}

                                    <span className="d-block font-weight-bold name">
                                      <Link
                                        style={{
                                          textDecoration: 'none',
                                          color: 'inherit',
                                        }}
                                        to={`/profile/${post.postedBy._id}`}
                                      >
                                        {post.postedBy.name} &nbsp;{' '}
                                      </Link>
                                    </span>

                                    <span className="date text-black-50">
                                      Shared publicly -{' '}
                                      {/* {formattedDate(post.createdAt)} */}
                                      {timeDifference(
                                        new Date(),
                                        new Date(post.createdAt)
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-2">
                                  <p className="comment-text">{post.content}</p>
                                </div>

                                {/* <p className="comment-text">{post.image}</p>

                            {post?.image !== '' ||
                              (post?.image !== undefined && (
                                <div className="mt-2">
                                  <Image
                                    src={post?.image}
                                    alt={'Post Image'}
                                    fluid
                                  />
                                </div>
                              ))} */}

                                <ListGroup.Item>
                                  <div className="d-flex flex-row user-info">
                                    <img
                                      style={{ marginRight: '10px' }}
                                      className="rounded-circle"
                                      src="https://i.imgur.com/RpzrMR2.jpg"
                                      width="40"
                                      alt="User"
                                    />
                                    <div className="d-flex flex-column justify-content-start ml-2">
                                      <span className="d-block font-weight-bold name">
                                        {/* {
                                      post?.sharePost?.postShared?.postedBy
                                        ?.name
                                    }{' '} */}
                                        <Link
                                          style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                          }}
                                          to={`/profile/${post?.sharePost?.postShared?.postedBy?._id}`}
                                        >
                                          {
                                            post?.sharePost?.postShared
                                              ?.postedBy?.name
                                          }
                                        </Link>
                                      </span>
                                      <span className="date text-black-50">
                                        Shared publicly -{' '}
                                        {/* {formattedDate(
                                      post?.sharePost?.postShared?.createdAt
                                    )} */}
                                        {timeDifference(
                                          new Date(),
                                          new Date(
                                            post?.sharePost?.postShared?.createdAt
                                          )
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-1 border-bottom ">
                                    <p>
                                      {post?.sharePost?.postShared?.content}{' '}
                                      &nbsp;{' '}
                                    </p>
                                    <div className="mt-2">
                                      {post?.sharePost?.postShared?.images
                                        ?.length > 0 && (
                                        <div className="mt-2">
                                          {post?.sharePost?.postShared?.images.map(
                                            (imagee, index) => (
                                              <Image
                                                key={index}
                                                style={{
                                                  width: '150px',
                                                  height: '150px',
                                                  objectFit: 'cover', // This property ensures the image retains its aspect ratio and covers the specified dimensions
                                                  marginLeft: '6px',
                                                }}
                                                src={imagee.url_image}
                                                alt={'Post Image'}
                                                fluid
                                              />
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <br />

                                    {/* HMM */}

                                    {getLikeCount(post.reaction) > 0 && (
                                      <i className="text-primary p-0">
                                        <FaThumbsUp />
                                      </i>
                                    )}

                                    {getHeartCount(post.reaction) > 0 && (
                                      <i
                                        style={{
                                          color: 'red',
                                          marginLeft: '5px',
                                        }}
                                        className="p-0"
                                      >
                                        <FaHeart />
                                      </i>
                                    )}

                                    <span style={{ marginLeft: '5px' }}>
                                      {post.reaction.length > 0 &&
                                        post.reaction.length}
                                    </span>
                                  </div>

                                  <div className="bg-white">
                                    <div className="d-flex flex-row fs-12">
                                      <div
                                        style={{ cursor: 'pointer' }}
                                        className="like p-2 cursor"
                                        title="Like Shared Post"
                                        // BRB
                                        onClick={
                                          checkPostIsLiked(post.reaction) === -1
                                            ? () =>
                                                addReaction(post._id, 'like')
                                            : () => removeReaction(post._id)
                                        }
                                      >
                                        <i
                                          style={{
                                            color:
                                              checkPostIsLiked(
                                                post.reaction
                                              ) === -1
                                                ? ''
                                                : 'blue',
                                          }}
                                          className="p-2"
                                        >
                                          <FaThumbsUp />
                                        </i>
                                        <span className="ml-1">Like</span>
                                      </div>
                                      <div
                                        style={{ cursor: 'pointer' }}
                                        className="like p-2 cursor"
                                        title="Heart Shared Post"
                                        // onClick={() => addReaction(post._id, 'heart')}
                                        onClick={
                                          checkPostIsHearted(post.reaction) ===
                                          -1
                                            ? () =>
                                                addReaction(post._id, 'heart')
                                            : () => removeReaction(post._id)
                                        }
                                      >
                                        <i
                                          style={{
                                            color:
                                              checkPostIsHearted(
                                                post.reaction
                                              ) === -1
                                                ? ''
                                                : 'red',
                                          }}
                                          className="p-2"
                                        >
                                          <FaHeart />
                                        </i>
                                        <span className="ml-1">Heart</span>
                                      </div>

                                      <div className="like p-2 cursor">
                                        <i className="p-2">
                                          <FaComment />
                                        </i>
                                        {/* <span className="ml-1">Comment</span> */}
                                        <Link
                                          style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                          }}
                                          title="View comments"
                                          to={`/${post._id}`}
                                        >
                                          <span className="ml-1">
                                            Comment
                                            {post.commentsPost.length > 0 && (
                                              <span>
                                                {' '}
                                                ({post.commentsPost.length})
                                              </span>
                                            )}
                                          </span>
                                        </Link>
                                      </div>

                                      <div
                                        className="like p-2 cursor"
                                        title="Sharing a shared post"
                                      >
                                        <i className="p-2">
                                          <FaShare />
                                        </i>
                                        <span
                                          style={{ cursor: 'pointer' }}
                                          className="ml-1"
                                          onClick={() =>
                                            handleShareSharedPostShow(
                                              post.sharePost
                                            )
                                          }
                                        >
                                          Sharepp
                                        </span>

                                        {storedSharedPost && (
                                          <SharingSharedPost
                                            setShowSharedSharePostModal={
                                              setShowSharedSharePostModal
                                            }
                                            storedSharedPost={storedSharedPost}
                                            showSharedSharePostModal={
                                              showSharedSharePostModal
                                            }
                                            handleShareSharedPostClose={
                                              handleShareSharedPostClose
                                            }
                                            refetch={refetch}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              </ListGroup>
                            ) : (
                              <div>
                                <div className="d-flex flex-row user-info">
                                  <img
                                    style={{ marginRight: '10px' }}
                                    className="rounded-circle"
                                    src="https://i.imgur.com/RpzrMR2.jpg"
                                    width="40"
                                    alt="User"
                                  />
                                  <div className="d-flex flex-column justify-content-start ml-2">
                                    <span className="d-block font-weight-bold name">
                                      {/* {post.postedBy.name} &nbsp;{' '} */}
                                      <Link
                                        style={{
                                          textDecoration: 'none',
                                          color: 'inherit',
                                        }}
                                        to={`/profile/${post.postedBy._id}`}
                                      >
                                        {post.postedBy.name}
                                      </Link>
                                    </span>
                                    <span className="date text-black-50">
                                      Shared publicly -{' '}
                                      {/* {formattedDate(post.createdAt)} */}
                                      {timeDifference(
                                        new Date(),
                                        new Date(post.createdAt)
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-1 border-bottom">
                                  <p className="mb-1 comment-text">
                                    {post.content}
                                  </p>

                                  {/* <br /> */}
                                  {/* <span>{post.image}</span> */}

                                  {/* <Image
                              style={{ maxWidth: '350px', maxHeight: '350px' }}
                              src={post.image}
                              alt={'Post Image'}
                              fluid
                            /> */}
                                  <div className="mt-2">
                                    {post.images?.length > 0 && (
                                      <div className="mt-2">
                                        {post.images.map((imagee, index) => (
                                          <Image
                                            key={index}
                                            style={{
                                              width: '150px',
                                              height: '150px',
                                              objectFit: 'cover', // This property ensures the image retains its aspect ratio and covers the specified dimensions
                                              marginLeft: '6px',
                                            }}
                                            src={imagee.url_image}
                                            alt={'Post Image'}
                                            fluid
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <br />

                                  {getLikeCount(post.reaction) > 0 && (
                                    <i className="text-primary p-0">
                                      <FaThumbsUp />
                                    </i>
                                  )}

                                  {getHeartCount(post.reaction) > 0 && (
                                    <i
                                      style={{
                                        color: 'red',
                                        marginLeft: '5px',
                                      }}
                                      className="p-0"
                                    >
                                      <FaHeart />
                                    </i>
                                  )}

                                  <span
                                    className="p-1"
                                    style={{ marginLeft: '5px' }}
                                    // onClick={() =>
                                    //   handleReactionShow(post.reaction)
                                    // }
                                  >
                                    {post.reaction.length > 0 &&
                                      post.reaction.length}
                                  </span>
                                </div>

                                <div className="bg-white">
                                  <div className="d-flex flex-row fs-12">
                                    <div
                                      style={{ cursor: 'pointer' }}
                                      className="like p-2 cursor"
                                      title="Like Post"
                                      // onClick={() => addReaction(post._id, 'like')}
                                      // BRB
                                      onClick={
                                        checkPostIsLiked(post.reaction) === -1
                                          ? () => addReaction(post._id, 'like')
                                          : () => removeReaction(post._id)
                                      }
                                    >
                                      <i
                                        style={{
                                          color:
                                            checkPostIsLiked(post.reaction) ===
                                            -1
                                              ? ''
                                              : 'blue',
                                        }}
                                        className="p-2"
                                      >
                                        <FaThumbsUp />
                                      </i>
                                      <span className="ml-1">Like</span>
                                    </div>
                                    <div
                                      style={{ cursor: 'pointer' }}
                                      className="like p-2 cursor"
                                      title="Heart Post"
                                      onClick={
                                        checkPostIsHearted(post.reaction) === -1
                                          ? () => addReaction(post._id, 'heart')
                                          : () => removeReaction(post._id)
                                      }
                                    >
                                      <i
                                        style={{
                                          color:
                                            checkPostIsHearted(
                                              post.reaction
                                            ) === -1
                                              ? ''
                                              : 'red',
                                        }}
                                        className="p-2"
                                      >
                                        <FaHeart />
                                      </i>
                                      <span className="ml-1">Heart</span>
                                    </div>
                                    <div className="like p-2 cursor">
                                      <i className="p-2">
                                        <FaComment />
                                      </i>
                                      <Link
                                        style={{
                                          textDecoration: 'none',
                                          color: 'inherit',
                                        }}
                                        title="View comments"
                                        to={`/${post._id}`}
                                      >
                                        <span className="ml-1">
                                          Comment
                                          {post.commentsPost.length > 0 && (
                                            <span>
                                              ({post.commentsPost.length})
                                            </span>
                                          )}
                                        </span>
                                      </Link>
                                    </div>

                                    <div
                                      className="like p-2 cursor"
                                      title="Sharing a post"
                                    >
                                      <i className="p-2">
                                        <span>
                                          {/* <PostOfSharedPost
                                            isPostRefetch={isRefetchTriggered}
                                            postId={post._id}
                                            setIsRefetchTriggered={
                                              setIsRefetchTriggered
                                            }
                                          />{' '} */}
                                        </span>
                                        <FaShare />
                                      </i>

                                      <span
                                        className="ml-1"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                          handleSharePostShow(post)
                                        }
                                      >
                                        Sharee
                                      </span>

                                      {storedPost && (
                                        <SharingPost
                                          refetch={refetch}
                                          storedPost={storedPost}
                                          showSharePostModal={
                                            showSharePostModal
                                          }
                                          handleSharePostClose={
                                            handleSharePostClose
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RIGHT  */}
              <div className="d-none d-xl-block col-xl-3 right-wrapper">
                <div className="row">
                  <div className="col-md-12 grid-margin">
                    <div className="card rounded">
                      <div className="card-body">
                        <h6 className="card-title">Friends</h6>
                        <div className="latest-photos">
                          <div className="row">
                            <div className="col-md-4">
                              <figure>
                                <img
                                  className="img-fluid"
                                  src="https://bootdey.com/img/Content/avatar/avatar1.png"
                                  alt=""
                                />
                              </figure>
                            </div>
                            <div className="col-md-4">
                              <figure>
                                <img
                                  className="img-fluid"
                                  src="https://bootdey.com/img/Content/avatar/avatar2.png"
                                  alt=""
                                />
                              </figure>
                            </div>
                            {/* Repeat the pattern for the remaining images */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-12 grid-margin">
                    <div className="card rounded">
                      <div className="card-body">
                        <h6 className="card-title">suggestions for you</h6>
                        {/* Suggestions Content */}
                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                          {/* Individual Suggestion */}
                          <div className="d-flex align-items-center hover-pointer">
                            <img
                              className="img-xs rounded-circle"
                              src="https://bootdey.com/img/Content/avatar/avatar2.png"
                              alt=""
                            />
                            <div className="ml-2">
                              <p>Mike Popescu</p>
                              <p className="tx-11 text-muted">
                                12 Mutual Friends
                              </p>
                            </div>
                          </div>
                          <button className="btn btn-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="feather feather-user-plus"
                              data-toggle="tooltip"
                              title=""
                              data-original-title="Connect"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                          </button>
                        </div>
                        {/* Repeat the pattern for the remaining suggestions */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
