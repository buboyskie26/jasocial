import React, { useEffect, useState } from 'react';
import {
  useAddPostLikeMutation,
  useAddPostMutation,
  useDeletePostLikeMutation,
  useDeletePostMutation,
  useGetAllFeedPostQuery,
  useSharePostMutation,
  useSharingASharedPostMutation,
  useUpdatePostMutation,
  useUploadProductImageMutation,
} from '../slices/postsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { timeDifference } from '../utils/helper';
import {
  FaComment,
  FaEdit,
  FaHeart,
  FaPhotoVideo,
  FaRegTimesCircle,
  FaShare,
  FaThumbsUp,
} from 'react-icons/fa';
import { Button, Form, Image, ListGroup, Modal, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import UserReactionList from '../components/UserReactionList';
import PostOfSharedPost from '../components/PostOfSharedPost';
import ShowUserReactionPost from '../components/ShowUserReactionPost';
import SharingSharedPost from '../components/SharingSharedPost';
import SharingPost from '../components/SharingPost';
import PostEdit from '../components/PostEdit';

import io from 'socket.io-client';
const socket = io('http://localhost:5000'); // Replace with your server URL

const PostScreen = () => {
  //
  const { data: myPosts, refetch, isLoading, error } = useGetAllFeedPostQuery();

  // console.log(myPosts);

  const [postContent, setPostContent] = useState('');
  const [postFeedContent, setPostFeedContent] = useState('');
  const [postId, setPostId] = useState(0);

  const { userInfo } = useSelector((w) => w.auth);

  const [showModal, setShowModal] = useState(false);

  const handlePostEdit = (post) => {
    setShowModal(true);
    setPostContent(post.content);
    setPostId(post._id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [updatePost, { isLoading: updatePostLoading, error: updatePostError }] =
    useUpdatePostMutation();

  const editPostContentHandler = async (e) => {
    e.preventDefault();

    // console.log(postId);
    try {
      const res = await updatePost({
        postId: postId,
        content: postContent,
      }).unwrap();

      // console.log(res);
      // await refetch();

      await refetch();

      toast.success('Post successfully edited');
      setPostContent('');
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Images Photo changing.

  const [
    uploadProductImage,
    { isLoading: uploadProductLoading, error: uploadError },
  ] = useUploadProductImageMutation();

  const [image, setImage] = useState('');

  const uploadFileHandler = async (e) => {
    const formData = new FormData();

    // console.log('upload file')

    formData.append('image', e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
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

    // try {
    //   // Use the appropriate API endpoint for handling multiple file uploads
    //   const res = await uploadMessageImage(formData).unwrap();
    //   // Handle the response as needed
    //   console.log(res);
    //   setImagesDb(res.images);
    // } catch (err) {
    //   // Handle errors
    //   console.error(err?.data?.message || err.error);
    // }

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      // console.log(res);
      // setImage(res.image);
      setImagesDb(res.images);

      //   setImagesDb(res.images);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  let [addPost, { isLoading: addPostLoading, error: addPostError }] =
    useAddPostMutation();

  // BAPO
  const addPostFeedHandler = async (e) => {
    //
    e.preventDefault();
    // console.log(`postFeedContent: ${postFeedContent}`);

    // console.log(imagesDb);

    try {
      const res = await addPost({
        content: postFeedContent,
        // image: image,
        imagesUploads: imagesDb.length > 0 ? imagesDb : [],
      }).unwrap();

      // console.log(res);
      refetch();
      toast.success('Post Content successfully made');
      setPostFeedContent('');
      setImage('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

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

  const [showModalReactions, setShowModalReactions] = useState(false);
  const [selectedSamples, setSelectedSamples] = useState(null);

  const handleReactionShow = (postReaction) => {
    const usersReaction = postReaction.map((w) => w.user);

    setSelectedSamples(usersReaction);
    setShowModalReactions(true);
  };

  //  console.log(selectedSamples)

  const handleClose = () => {
    setSelectedSamples(null);
    setShowModalReactions(false);
    // other logic as needed
  };

  // Sharing a Non-shared Post
  const [sharePost] = useSharePostMutation();
  const [showSharePostModal, setShowSharePostModal] = useState(false);
  const [storedPost, setStoredPost] = useState(null);

  const [sharedPostContent, setSharedPostContent] = useState('');

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

  const sharePostHandler = async (toSharePostId, e) => {
    e.preventDefault();
    // console.log(`toSharePostId: ${toSharePostId}`);

    try {
      const res = await sharePost({
        postId: toSharePostId,
        content: sharedPostContent,
      }).unwrap();
      // console.log(res);
      handleSharePostClose();
      refetch();
      toast.success('Successfully shared the post.');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
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

  const [isRefetchTriggered, setIsRefetchTriggered] = useState(false);

  const sharingSharedPostPostHandler = async (sharePostId, e) => {
    //
    e.preventDefault();
    // console.log(`sharePostId: ${sharePostId}`);
    // console.log(`sharedPostContent: ${sharedPostContent}`);

    try {
      const res = await sharingSharedPost({
        postId: sharePostId,
        content: sharedPostContent,
      }).unwrap();
      // console.log(res);
      refetch();
      // setIsRefetchTriggered(true);
      setShowSharedSharePostModal(false);
      setSharedPostContent('');

      toast.success('Successfully shared the shared post.');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  //
  // console.log(isRefetchTriggered);

  const [showImageModal, setShowImageModal] = useState(false);
  const [file, setFile] = useState(null);

  const handleShowv2 = () => setShowImageModal(true);
  const handleClosev2 = () => setShowImageModal(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <>
      {addPostLoading && <Loader />}

      <div className="card shadow-0">
        <div className="card-body border-bottom pb-2">
          <Form onSubmit={addPostFeedHandler}>
            <div className="d-flex">
              <img
                src="https://i.imgur.com/RpzrMR2.jpg"
                className="rounded-circle"
                height="50"
                alt="Avatar"
                loading="lazy"
              />
              <div className="d-flex align-items-center w-100 ps-3">
                <div className="w-100">
                  <Form.Control
                    className="form-control form-status border-0 py-1 px-0"
                    as="textarea"
                    placeholder="What's happening"
                    row="2"
                    required
                    value={postFeedContent}
                    onChange={(e) => setPostFeedContent(e.target.value)}
                  ></Form.Control>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <Nav
                className="list-unstyled d-flex flex-row ps-3 pt-3"
                style={{ marginLeft: '50px' }}
              >
                <Nav.Item>
                  <Nav.Link href="#" onClick={handleShowv2}>
                    <FaPhotoVideo title="Upload image" />
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Modal show={showImageModal} onHide={handleClosev2}>
                <Modal.Header closeButton>
                  <Modal.Title>Upload Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group controlId="image">
                    <Form.Group controlId="images">
                      <Form.Control
                        label="Choose Files"
                        onChange={uploadFilesHandlerv2}
                        type="file"
                        accept="image/*"
                        multiple
                      />
                    </Form.Group>
                    {/* <Image src={image} alt={'Post Image'} fluid /> */}
                    {/* <Form.Control
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
                    ></Form.Control> */}
                  </Form.Group>
                </Modal.Body>
              </Modal>

              <div className="d-flex align-items-center">
                <Button
                  variant="btn btn-primary btn-rounded"
                  type="submit"
                  disabled={postFeedContent === ''}
                >
                  Post
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
      {updatePostLoading && <Loader />}

      {error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          {myPosts &&
            myPosts.map((post, index) => (
              <div className="container mt-5" key={index}>
                <div className="d-flex justify-content-center row">
                  <div className="col-md-8">
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

                        {/* EDIT AND REMOVE OWN POST */}
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
                              {/* <Modal
                                show={showModal}
                                onHide={handleCloseModal}
                                backdrop="static"
                              >
                                <Form onSubmit={editPostContentHandler}>
                                  <Modal.Header closeButton>
                                    <Modal.Title>Edit Post</Modal.Title>
                                  </Modal.Header>
                                  <Modal.Body>
                                    <Form.Control
                                      className="form-control ml-1 shadow-none textarea"
                                      as="textarea"
                                      row="3"
                                      required
                                      value={postContent}
                                      onChange={(e) =>
                                        setPostContent(e.target.value)
                                      }
                                    ></Form.Control>
                                  </Modal.Body>
                                  <Modal.Footer>
                                    <Button
                                      variant="secondary"
                                      onClick={handleCloseModal}
                                    >
                                      Close
                                    </Button>
                                    <Button variant="primary" type="submit">
                                      Save Changes
                                    </Button>
                                  </Modal.Footer>
                                </Form>
                              </Modal> */}
                              <PostEdit
                                postContent={postContent}
                                postId={postId}
                                setPostContent={setPostContent}
                                setShowModal={setShowModal}
                                refetch={refetch}
                                showModal={showModal}
                                handleCloseModal={handleCloseModal}
                              />
                            </span>
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
                                        post?.sharePost?.postShared?.postedBy
                                          ?.name
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
                                  {post?.sharePost?.postShared?.content} &nbsp;{' '}
                                </p>
                                <div className="mt-2">
                                  {post?.sharePost?.postShared?.images?.length >
                                    0 && (
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
                                  <i style={{ color: 'red' }} className="p-1">
                                    <FaHeart />
                                  </i>
                                )}

                                {/* <span style={{ marginLeft: '5px' }}>
                                  {post.reaction.length > 0 &&
                                    post.reaction.length}
                                </span> */}

                                <span
                                  style={{ marginLeft: '5px' }}
                                  className="p-0"
                                  onClick={() =>
                                    handleReactionShow(post.reaction)
                                  }
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
                                    title="Like Shared Post"
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
                                          checkPostIsLiked(post.reaction) === -1
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
                                      checkPostIsHearted(post.reaction) === -1
                                        ? () => addReaction(post._id, 'heart')
                                        : () => removeReaction(post._id)
                                    }
                                  >
                                    <i
                                      style={{
                                        color:
                                          checkPostIsHearted(post.reaction) ===
                                          -1
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
                                    <span className="ml-1">
                                      Comment
                                      {post.commentsPost.length > 0 && (
                                        <span>
                                          {' '}
                                          ({post.commentsPost.length})
                                        </span>
                                      )}
                                    </span>
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
                                <i style={{ color: 'red' }} className="p-1">
                                  <FaHeart />
                                </i>
                              )}

                              <span
                                style={{ marginLeft: '5px' }}
                                className="p-0"
                                onClick={() =>
                                  handleReactionShow(post.reaction)
                                }
                              >
                                {post.reaction.length > 0 &&
                                  post.reaction.length}
                              </span>

                              {/* {selectedSamples && (
                                <Modal
                                  show={showModalReactions}
                                  onHide={handleClose}
                                  backdrop="static"
                                >
                                  <Modal.Header closeButton>
                                    <Modal.Title>
                                      User react to a post
                                    </Modal.Title>
                                  </Modal.Header>
                                  <Modal.Body>
                                    {selectedSamples.map((sample, index) => (
                                      <div key={sample._id}>
                                        <p>
                                          Name: {sample.name} <span>Like</span>{' '}
                                        </p>
                                        <p>Email: {sample.email}</p>
                                        <p>
                                          <Button variant="primary">
                                            Add Friend
                                          </Button>
                                        </p>
                                        <hr />
                                      </div>
                                    ))}
                                  </Modal.Body>
                                </Modal>
                              )} */}

                              {selectedSamples && (
                                <ShowUserReactionPost
                                  showModalReactions={showModalReactions}
                                  handleClose={handleClose}
                                  selectedSamples={selectedSamples}
                                />
                              )}
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
                                        checkPostIsLiked(post.reaction) === -1
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
                                        checkPostIsHearted(post.reaction) === -1
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
                                  <span className="ml-1">
                                    Comment
                                    {post.commentsPost.length > 0 && (
                                      <span> ({post.commentsPost.length})</span>
                                    )}
                                  </span>
                                </div>

                                <div
                                  className="like p-2 cursor"
                                  title="Sharing a post"
                                >
                                  <i className="p-2">
                                    <span>
                                      <PostOfSharedPost
                                        // isPostRefetch={isRefetchTriggered}
                                        postId={post._id}
                                        // setIsRefetchTriggered={
                                        //   setIsRefetchTriggered
                                        // }
                                      />{' '}
                                    </span>
                                    <FaShare />
                                  </i>

                                  <span
                                    className="ml-1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSharePostShow(post)}
                                  >
                                    Sharee
                                  </span>

                                  {/* {storedPost !== null && (
                                    <Modal
                                      show={showSharePostModal}
                                      onHide={handleSharePostClose}
                                      backdrop="static"
                                    >
                                      <Modal.Header closeButton>
                                        <Modal.Title>Sharing post</Modal.Title>
                                      </Modal.Header>

                                      <Form
                                        onSubmit={(e) =>
                                          sharePostHandler(storedPost._id, e)
                                        }
                                      >
                                        <Modal.Body>
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
                                                  <Link
                                                    style={{
                                                      textDecoration: 'none',
                                                      color: 'inherit',
                                                    }}
                                                    to={`/profile/${storedPost.postedBy._id}`}
                                                  >
                                                    {storedPost.postedBy.name}
                                                  </Link>
                                                  &nbsp;{' '}
                                                </span>
                                                <span className="date text-black-50">
                                                  Shared publicly -{' '}
                                                  {timeDifference(
                                                    new Date(),
                                                    new Date(
                                                      storedPost.createdAt
                                                    )
                                                  )}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="mt-1 border-bottom">
                                              <p className="comment-text">
                                                {storedPost.content}
                                              </p>

                                              <div className="mt-2">
                                                {storedPost.images?.length >
                                                  0 && (
                                                  <div className="mt-2">
                                                    {storedPost.images.map(
                                                      (imagee, index) => (
                                                        <Image
                                                          key={index}
                                                          style={{
                                                            width: '100px',
                                                            height: '100px',
                                                            objectFit: 'cover', 
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
                                            </div>

                                            <div className="d-flex align-items-center w-100 ps-3">
                                              <div className="w-100">
                                                <Form.Control
                                                  className="form-control form-status border-0 py-1 px-0"
                                                  as="textarea"
                                                  placeholder="Write a content on the shared post"
                                                  row="2"
                                                  required
                                                  value={sharedPostContent}
                                                  onChange={(e) =>
                                                    setSharedPostContent(
                                                      e.target.value
                                                    )
                                                  }
                                                ></Form.Control>
                                              </div>
                                            </div>
                                          </div>
                                        </Modal.Body>
                                        <Modal.Footer>
                                          <Button
                                            variant="secondary"
                                            onClick={handleSharePostClose}
                                          >
                                            Close
                                          </Button>
                                          <Button
                                            variant="primary"
                                            type="submit"
                                          >
                                            Share post
                                          </Button>
                                        </Modal.Footer>
                                      </Form>
                                      
                                    </Modal>
                                  )} */}

                                  {storedPost && (
                                    <SharingPost
                                      refetch={refetch}
                                      storedPost={storedPost}
                                      showSharePostModal={showSharePostModal}
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
                </div>
              </div>
            ))}
        </>
      )}
    </>
  );
};

export default PostScreen;
