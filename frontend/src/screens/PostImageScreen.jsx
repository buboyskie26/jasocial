import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './post_image.css';
import {
  useAddCommentToImagePostMutation,
  useDeleteCommentOnPostImageMutation,
  useGetPostImageCommentsQuery,
  useGetSinglePostQuery,
} from '../slices/postsApiSlice';
import {
  FaArrowLeft,
  FaArrowRight,
  FaComment,
  FaEdit,
  FaHeart,
  FaRegTimesCircle,
  FaShare,
  FaThumbsUp,
} from 'react-icons/fa';
import { Button, Col, ListGroup, Form } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const PostImageScreen = () => {
  const { postId, imageId } = useParams();

  //   console.log(postId);
  //   console.log(imageId);

  const {
    data: post,
    refetch,
    isLoading,
    error,
  } = useGetSinglePostQuery(postId);
  
  const { userInfo } = useSelector((w) => w.auth);

  // const {
  //   data: postImageObj,
  //   isLoading: postImageObjLoading,
  //   error: postImageObjError,
  // } = useGetPostImageCommentsQuery(imageId, postId);

  console.log(post);

  const postImage = (postImages) => {
    // console.log(postImages);
    const matchingImage = postImages.find((image) => image._id === imageId);
    return matchingImage ? matchingImage.url_image : null;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = (images) => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);

    const nextId = images[nextIndex]._id;
    // Update the URL with the new _id
    navigate(`/${postId}/photo/${nextId}`);
  };

  const handlePrev = (images) => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);

    const prevId = images[prevIndex]._id;
    // Update the URL with the new _id
    navigate(`/${postId}/photo/${prevId}`);
  };

  const [addCommentToImage, { isLoading: addCommentToImageLoading }] =
    useAddCommentToImagePostMutation();

  const [comment, setComment] = useState('');

  const addCommentHandler = async (e) => {
    e.preventDefault();
    try {
      await addCommentToImage({
        imageId,
        postId,
        comment: comment,
      }).unwrap();
      setComment('');
      toast.success('Successfully commented on a post');

      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [deleteComment] = useDeleteCommentOnPostImageMutation();

  const deleteCommentClick = async (commentId) => {
    if (window.confirm('You`re deleting the post!. Are you sure?')) {
      // console.log(`commentId: ${commentId}`);
      try {
        await deleteComment({
          imageId,
          postId,
          commentId,
        }).unwrap();
        toast.success('Comment has been successfully removed');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="container posts-content">
      {error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          {post?.map((w) => (
            <div key={w._id} className="row">
              <div className="col-lg-6">
                <div className="card mb-4">
                  <div className="card-body">
                    {/* <a
                  className="ui-rect ui-bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://bootdey.com/img/Content/avatar/avatar3.png')",
                  }}
                ></a> */}
                    <img
                      className="ui-rectv2"
                      src={postImage(w.images)}
                      alt=""
                    />
                  </div>
                </div>
                <span onClick={() => handlePrev(w.images)}>
                  {' '}
                  <FaArrowLeft />
                </span>
                <span onClick={() => handleNext(w.images)}>
                  {' '}
                  <FaArrowRight />
                </span>
              </div>

              <div className="col-lg-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="media mb-3">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar1.png"
                        className="d-block ui-w-40 rounded-circle"
                        alt=""
                      />
                      <div className="media-body ml-3">
                        {w.postedBy.name}
                        <div className="text-muted small">3 days ago</div>
                      </div>
                    </div>

                    {/* <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus finibus commodo bibendum. Vivamus laoreet blandit
                odio, vel finibus quam dictum ut.
              </p> */}
                  </div>

                  <div className="card-footer">
                    <div className="d-flex flex-row fs-12">
                      <div
                        style={{ cursor: 'pointer' }}
                        className="like p-2 cursor"
                        title="Like Post"
                        // onClick={() => addReaction(post._id, 'like')}
                        // BRB
                      >
                        <i
                          //   style={{
                          //     color: checkPostIsLiked(post.reaction) === -1 ? '' : 'blue',
                          //   }}
                          style={{
                            color: 'blue',
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
                      >
                        <i
                          // style={{
                          //   color:
                          //     checkPostIsHearted(post.reaction) === -1 ? '' : 'red',
                          // }}
                          style={{
                            color: 'red',
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
                          {/* {post.commentsPost.length > 0 && (
                      <span> ({post.commentsPost.length})</span>
                    )} */}
                        </span>
                      </div>
                      <div
                        style={{ cursor: 'pointer' }}
                        className="like p-2 cursor"
                      >
                        <i className="p-2">
                          <FaShare />
                        </i>
                        <span className="ml-1">Share</span>
                      </div>
                    </div>
                  </div>

                  {w.images.length > 0 &&
                    w.images.map((img) =>
                      img.comments.map(
                        (com, index) =>
                          img._id === imageId && (
                            <div key={index}>
                              <ListGroup key={com._id}>
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
                                      <h6 className="ml-2">{com.user.name}</h6>
                                      <span style={{ marginLeft: '5px' }}>
                                        4 hours ago
                                      </span>
                                      {com.user._id === userInfo._id && (
                                        <div>
                                          <span
                                            style={{
                                              marginLeft: '190px',
                                              cursor: 'pointer',
                                            }}
                                            className="mb-1 ml-2"
                                          >
                                            <FaEdit />
                                          </span>
                                          <span
                                            style={{
                                              marginLeft: '7px',
                                              cursor: 'pointer',
                                            }}
                                            className="mb-1 ml-2"
                                            onClick={() =>
                                              deleteCommentClick(com._id)
                                            }
                                          >
                                            <FaRegTimesCircle
                                              style={{ color: 'red' }}
                                            />
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      style={{ marginLeft: '48.5px' }}
                                      className="comment-text-sm"
                                    >
                                      <span>{com.comment}</span>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              </ListGroup>
                            </div>
                          )
                      )
                    )}

                  <div className="bg-light p-2">
                    <Form onSubmit={addCommentHandler}>
                      <div className="d-flex flex-row align-items-start">
                        <img
                          className="rounded-circle"
                          src="https://i.imgur.com/RpzrMR2.jpg"
                          width="40"
                          alt="User"
                          style={{ marginRight: '10px', marginLeft: '10px' }}
                        />

                        <Form.Control
                          className="form-control form-status border-0 py-1 px-0"
                          as="textarea"
                          placeholder="Write a comment"
                          row="2"
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                        <div
                          className="list-group-item"
                          style={{ marginTop: '23px', marginLeft: '5px' }}
                        >
                          <Button
                            type="submit"
                            disabled={comment === ''}
                            className="btn btn-primary btn-sm shadow-none btn btn-primary"
                          >
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth="0"
                              viewBox="0 0 512 512"
                              height="1em"
                              width="1em"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PostImageScreen;
