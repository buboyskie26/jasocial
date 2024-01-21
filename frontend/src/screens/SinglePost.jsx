import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useAddCommentToPostMutation,
  useAddPostLikeMutation,
  useDeleteCommentToPostMutation,
  useDeletePostLikeMutation,
  useEditCommentToPostMutation,
  useGetSingleCommentQuery,
  useGetSinglePostQuery,
  useSharePostMutation,
} from '../slices/postsApiSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  FaSortUp,
  FaSortDown,
  FaThumbsUp,
  FaHeart,
  FaEdit,
  FaTimes,
  FaTimesCircle,
  FaRegTimesCircle,
  FaShare,
  FaComment,
  FaPaperPlane,
} from 'react-icons/fa';
import { Button, ListGroup, Form, Modal, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import PostOfSharedPost from '../components/PostOfSharedPost';
import { LinkContainer } from 'react-router-bootstrap';

const SinglePost = () => {
  //
  const { id: postId } = useParams();

  const { userInfo } = useSelector((w) => w.auth);

  // console.log(userInfo);

  const {
    data: post,
    refetch,
    isLoading,
    error,
  } = useGetSinglePostQuery(postId);

  console.log(post);

  const formattedDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };

    const formatted = new Date(dateString).toLocaleString('en-PH', options);

    return formatted;
  };

  const [comment, setComment] = useState('');
  const [isEditComment, setIsEditComment] = useState(false);
  const [editCommentObj, setEditCommentObj] = useState(0);

  const [addComment, { isLoading: commentLoading, error: commentError }] =
    useAddCommentToPostMutation();

  const [
    editComment,
    { isLoading: editCommentLoading, error: editCommentError },
  ] = useEditCommentToPostMutation();

  const [
    deleteComment,
    { isLoading: deleteCommentLoading, error: deleteCommentError },
  ] = useDeleteCommentToPostMutation();

  const postCommentHandler = async (e) => {
    e.preventDefault();

    console.log(comment);

    try {
      await addComment({ postId: postId, body: comment }).unwrap();
      refetch();
      toast.success('Comment successfully posted');
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleEditClick = (comment) => {
    // Set the comment text and update the state for editing
    setComment(comment.body);
    setIsEditComment(true);
    setEditCommentObj(comment);
  };
  // console.log(isEditComment);

  const editCommentHandler = async (e) => {
    e.preventDefault();

    // console.log(`editing commentId: ${editCommentId}`);

    // console.log(editCommentObj);

    try {
      const res = await editComment({
        postId: postId,
        commentId: editCommentObj._id,
        body: comment,
      }).unwrap();

      console.log(res);
      refetch();
      toast.success('Comment successfully edited');
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteUserComment = async (commentId) => {
    console.log(`commentId: ${commentId}`);

    if (window.confirm('Are you sure')) {
      try {
        await deleteComment({ postId, commentId });
        refetch();
        toast.success('Comment successfully removed');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const checkPostIsLiked = (arrayData) => {
    const hasLiked = arrayData.findIndex(
      (item) => item.user === userInfo._id && item.type === 'like'
    );

    return hasLiked;
  };

  const getLikeCount = (arrayData) => {
    const likeCount = arrayData.filter((item) => item.type === 'like').length;
    return likeCount;
  };

  const getHeartCount = (arrayData) => {
    console.log(arrayData);

    const heartCount = arrayData.filter((item) => item.type === 'heart').length;
    console.log(`heartCount: ${heartCount}`);

    return heartCount;
  };

  const checkPostIsHearted = (arrayData) => {
    const hasHearted = arrayData.findIndex(
      (item) => item.user === userInfo._id && item.type === 'heart'
    );

    return hasHearted;
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
      console.log(res);
      refetch();
      // toast.success('Post successfully removed');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    //
  };

  const removeReaction = async (postId) => {
    console.log(`remove reaction ${postId}`);

    try {
      const res = await deletePostLike({ postId }).unwrap();
      console.log(res);
      refetch();
      // toast.success('Post successfully removed');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [sharePost] = useSharePostMutation();
  const [showSharePostModal, setShowSharePostModal] = useState(false);
  const [storedPost, setStoredPost] = useState(null);
  const [sharedPostContent, setSharedPostContent] = useState('');

  //
  const handleSharePostShow = (post) => {
    const { postedBy, content, createdAt, _id } = post;
    setStoredPost({ _id, postedBy, content, createdAt });
    setShowSharePostModal(true);
  };

  //  console.log(selectedSamples)

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
      console.log(res);
      // refetch();
      toast.success('Successfully shared a post.');
      handleSharePostClose();
      setSharedPostContent('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link className="btn btn-light" to="/">
        Go back
      </Link>
      {editCommentLoading && <Loader />}
      {deleteCommentLoading && <Loader />}
      {error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          {post.map((post, index) => (
            <div className="container mt-5" key={post._id}>
              <div className="d-flex justify-content-center row">
                <div className="col-md-8">
                  <div className="d-flex flex-column comment-section">
                    <div className="bg-white p-2">
                      <span
                        style={{ marginRight: '10px' }}
                        className="badge bg-primary px-2 py-1 shadow-1-strong mb-3"
                      >
                        {post?.sharePost !== undefined ? 'Shared Post' : 'Post'}
                      </span>
                      {post?.sharePost !== undefined && (
                        <span>
                          <span className="badge bg-primary px-2 py-1 shadow-1-strong mb-3">
                            <Link
                              to={`/${post?.sharePost?.postShared?._id}`}
                              className="nav-link"
                            >
                              View Original Post
                            </Link>
                          </span>
                        </span>
                      )}

                      {post?.sharePost?.postShared !== undefined ? (
                        <ListGroup>
                          <div
                            style={{
                              marginBottom: '10px',
                              marginLeft: '10px',
                            }}
                          >
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
                                  {post?.sharePost?.user?.name} &nbsp;{' '}
                                </span>
                                <span className="date text-black-50">
                                  Shared publicly -{' '}
                                  {formattedDate(post.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div
                              style={{ marginBottom: '5px' }}
                              className="mt-2"
                            >
                              <p className="comment-text">
                                {/* {post?.sharePost?.sharedPostContent} */}
                                {post.content}
                              </p>
                            </div>
                          </div>

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
                                  {post?.sharePost?.postShared?.postedBy?.name}{' '}
                                  &nbsp;{' '}
                                </span>
                                <span className="date text-black-50">
                                  Shared publicly -{' '}
                                  {formattedDate(
                                    post?.sharePost?.postShared?.createdAt
                                  )}{' '}
                                </span>
                              </div>
                            </div>

                            <div
                              style={{ marginBottom: '5px' }}
                              className="mt-2"
                            >
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
                                {post.postedBy.name} &nbsp;{' '}
                              </span>
                              <span className="date text-black-50">
                                Shared publiclyed -{' '}
                                {formattedDate(post.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div style={{ marginBottom: '5px' }} className="mt-2">
                            <p className="comment-text">{post.content}</p>

                            <div className="mt-2">
                              {post.images?.length > 0 && (
                                <div className="mt-2">
                                  {post.images.map((imagee, index) => (
                                    <Link to={`/${post._id}/photo/${imagee._id}`}>
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
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
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
                          <span style={{ marginLeft: '5px' }}>
                            {post.reaction.length > 0 && post.reaction.length}
                          </span>
                        </div>
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

                        <div className="like p-2 cursor">
                          <span>
                            <PostOfSharedPost
                              isPostRefetch={null}
                              postId={post._id}
                              setIsRefetchTriggered={null}
                            />
                          </span>{' '}
                          <FaShare />
                          <span
                            className="ml-1"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSharePostShow(post)}
                          >
                            {' '}
                            Sharee
                          </span>
                          {/*  */}
                          {storedPost !== null && (
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
                                  {/* // BASIS */}
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
                                          {storedPost.postedBy.name} &nbsp;{' '}
                                        </span>
                                        <span className="date text-black-50">
                                          Shared publicly -{' '}
                                          {formattedDate(storedPost.createdAt)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-1 border-bottom">
                                      <p className="comment-text">
                                        {storedPost.content}
                                      </p>
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
                                            setSharedPostContent(e.target.value)
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
                                    disabled={sharedPostContent === ''}
                                  >
                                    Share post
                                  </Button>
                                </Modal.Footer>
                              </Form>
                            </Modal>
                          )}
                          {/*  */}
                        </div>
                      </div>
                    </div>

                    {post.commentsPost.length > 0 ? (
                      post.commentsPost.map((comment) => (
                        <ListGroup key={comment.id}>
                          <ListGroup.Item>
                            <div className="commented-section mt-2">
                              <div className="d-flex flex-row align-items-center commented-user">
                                <img
                                  style={{ marginRight: '10px' }}
                                  className="rounded-circle"
                                  src="https://i.imgur.com/RpzrMR2.jpg"
                                  width="40"
                                  alt="User"
                                />
                                <h6
                                  style={{ marginRight: '10px' }}
                                  className="mr-2"
                                >
                                  {comment.commentBy.name}
                                </h6>

                                <span className="dot mb-1"></span>

                                <span className="mb-1 ml-2">4 hours agoe</span>

                                {comment.commentBy?._id === userInfo?._id && (
                                  <div>
                                    <span
                                      style={{
                                        marginLeft: '300px',
                                        cursor: 'pointer',
                                      }}
                                      className="mb-1 ml-2"
                                    >
                                      <FaEdit
                                        onClick={() => handleEditClick(comment)}
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
                                        onClick={() =>
                                          deleteUserComment(comment._id)
                                        }
                                      />
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div
                                style={{ marginLeft: '48.5px' }}
                                className="comment-text-sm"
                              >
                                <span>{comment.body}</span>
                              </div>

                              {false && (
                                <div className="reply-section">
                                  <div className="d-flex flex-row align-items-center voting-icons">
                                    <FaThumbsUp
                                      style={{ marginRight: '5px' }}
                                    />
                                    <span
                                      style={{ marginRight: '10px' }}
                                      className="ml-2"
                                    >
                                      10
                                    </span>
                                    <FaHeart style={{ marginRight: '5px' }} />
                                    <span
                                      style={{ marginRight: '10px' }}
                                      className="ml-2"
                                    >
                                      10
                                    </span>
                                    <span className="dot ml-2"></span>
                                    <h6 className="ml-2 mt-1">Reply</h6>
                                    <div
                                      style={{
                                        minWidth: '400px',
                                        marginLeft: '20px',
                                      }}
                                      className="bg-light p-2"
                                    >
                                      <div className="d-flex flex-row align-items-start">
                                        <img
                                          style={{
                                            marginRight: '10px',
                                          }}
                                          className="rounded-circle"
                                          src="https://i.imgur.com/RpzrMR2.jpg"
                                          width="40"
                                          alt="User"
                                        />
                                        <textarea className="form-control ml-1 shadow-none textarea"></textarea>
                                      </div>
                                      <div className="mt-2 text-right">
                                        <button
                                          className="btn btn-primary btn-sm shadow-none"
                                          type="button"
                                        >
                                          Reply Submit
                                        </button>
                                        <button
                                          className="btn btn-outline-primary btn-sm ml-1 shadow-none"
                                          type="button"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      ))
                    ) : (
                      <div style={{ marginTop: '7px' }}>
                        <Message>No Comments</Message>
                      </div>
                    )}

                    {/* POST COMMENT BUTTON*/}

                    <div className="bg-light p-2">
                      <Form
                        onSubmit={
                          !isEditComment
                            ? postCommentHandler
                            : editCommentHandler
                        }
                      >
                        <div className="d-flex flex-row align-items-start">
                          <img
                            style={{ marginRight: '10px', marginLeft: '10px' }}
                            className="rounded-circle"
                            src="https://i.imgur.com/RpzrMR2.jpg"
                            width="40"
                            alt="User"
                          />

                          <Form.Control
                            className="form-control ml-1 shadow-none textarea"
                            as="textarea"
                            row="3"
                            placeholder="Write a comment"
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></Form.Control>
                          <ListGroup.Item
                            style={{ marginTop: '23px', marginLeft: '5px' }}
                          >
                            <Button
                              className="btn btn-primary btn-sm shadow-none"
                              disabled={comment === ''}
                              type="submit"
                            >
                              <FaPaperPlane />
                            </Button>
                          </ListGroup.Item>
                        </div>
                      </Form>
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

export default SinglePost;
