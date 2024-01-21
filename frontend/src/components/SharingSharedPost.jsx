import React, { useState } from 'react';
import { Modal, Form, Button, Image } from 'react-bootstrap';
import { timeDifference } from '../utils/helper';
import { useSharingASharedPostMutation } from '../slices/postsApiSlice';
import { toast } from 'react-toastify';

const SharingSharedPost = ({
  setShowSharedSharePostModal,
  storedSharedPost,
  showSharedSharePostModal,
  handleShareSharedPostClose,
  refetch,
}) => {
  const [sharingSharedPost] = useSharingASharedPostMutation();

  const [sharedPostContent, setSharedPostContent] = useState('');

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
      setShowSharedSharePostModal(false);
      setSharedPostContent('');
      toast.success('Successfully shared the shared post.');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  console.log(storedSharedPost);
  return (
    <Modal
      show={showSharedSharePostModal}
      onHide={handleShareSharedPostClose}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Sharing a shared post</Modal.Title>
      </Modal.Header>

      <Form
        onSubmit={(e) => sharingSharedPostPostHandler(storedSharedPost._id, e)}
      >
        <Modal.Body>
          {/* // BASIS */}
          <div>
            <div className="d-flex flex-row user-info">
              <img
                style={{
                  marginRight: '10px',
                }}
                className="rounded-circle"
                src="https://i.imgur.com/RpzrMR2.jpg"
                width="40"
                alt="User"
              />
              <div className="d-flex flex-column justify-content-start ml-2">
                <span className="d-block font-weight-bold name">
                  {storedSharedPost.postedBy.name} &nbsp;{' '}
                </span>
                <span className="date text-black-50">
                  Shared publicly -{' '}
                  {timeDifference(
                    new Date(),
                    new Date(storedSharedPost.createdAt)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-1 border-bottom">
              <p className="comment-text">{storedSharedPost.content}</p>
              <div className="mt-2">
                {storedSharedPost.images?.length > 0 && (
                  <div className="mt-2">
                    {storedSharedPost.images.map((imagee, index) => (
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
          <Button variant="secondary" onClick={handleShareSharedPostClose}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={sharedPostContent === ''}
          >
            {' '}
            Share post
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SharingSharedPost;
