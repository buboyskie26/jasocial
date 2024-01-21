import React, { useState } from 'react';
import { Form, Modal, Image, Button } from 'react-bootstrap';
import { useSharePostMutation } from '../slices/postsApiSlice';
import { toast } from 'react-toastify';
import { timeDifference } from '../utils/helper';
import { Link } from 'react-router-dom';

const SharingPost = ({
  storedPost,
  showSharePostModal,
  handleSharePostClose,
  refetch,
}) => {
  //

  const [sharePost] = useSharePostMutation();
  const [sharedPostContent, setSharedPostContent] = useState('');

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

  return (
    <Modal
      show={showSharePostModal}
      onHide={handleSharePostClose}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Sharing post</Modal.Title>
      </Modal.Header>

      <Form onSubmit={(e) => sharePostHandler(storedPost._id, e)}>
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
                  {/* {storedPost.postedBy.name}{' '} */}
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
                  {timeDifference(new Date(), new Date(storedPost.createdAt))}
                </span>
              </div>
            </div>

            <div className="mt-1 border-bottom">
              <p className="comment-text">{storedPost.content}</p>

              <div className="mt-2">
                {storedPost.images?.length > 0 && (
                  <div className="mt-2">
                    {storedPost.images.map((imagee, index) => (
                      <Image
                        key={index}
                        style={{
                          width: '100px',
                          height: '100px',
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
                  onChange={(e) => setSharedPostContent(e.target.value)}
                ></Form.Control>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSharePostClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Share post
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SharingPost;
