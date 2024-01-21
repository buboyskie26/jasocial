import React, { useState } from 'react';
import { useGetPostsOfSharedPostQuery } from '../slices/postsApiSlice';
import { Badge, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PostOfSharedPost = ({  postId }) => {
  
  const { data: postOfSharedPost, refetch } =
    useGetPostsOfSharedPostQuery(postId);

  //   console.log(`Post ID: ${postId} ${postOfSharedPost?.length}`);
  // console.log(postOfSharedPost);

  // if (isPostRefetch && setIsRefetchTriggered) {
  //   refetch();
  //   setIsRefetchTriggered(false);
  // }

  const sharedLength =
    postOfSharedPost?.length > 0 ? postOfSharedPost?.length : '';

  const [showSharePostModal, setShowSharePostModal] = useState(null);
  const [storedPostShared, setStoredPostShared] = useState(null);

  //
  const handleSharePostShow = (sharedPostArray) => {
    setStoredPostShared(sharedPostArray);
    setShowSharePostModal(true);
  };

  const handleSharePostClose = (sharedPostArray) => {
    setStoredPostShared(null);
    setShowSharePostModal(false);
  };

  return (
    <>
      <Badge
        onClick={() => handleSharePostShow(postOfSharedPost)}
        variant="primary"
      >
        {sharedLength}
      </Badge>

      {storedPostShared && (
        <Modal
          show={showSharePostModal}
          onHide={handleSharePostClose}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>User who shared the post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {storedPostShared.map((sample, index) => (
              <div
                style={{ justifyContent: 'space-between' }}
                className="d-flex flex-row fs-12 border-bottom mb-3"
                key={sample._id}
              >
                <div>
                  <p>
                    Name: {sample.postedBy.name} <span>Like</span>{' '}
                  </p>
                  <p>Email: {sample.postedBy.email}</p>
                </div>
                <div style={{ marginLeft: '114px' }}>
                  <Link to={`/${sample._id}`}>
                    <Button  variant="primary">Show Post</Button>
                  </Link>
                </div>
                <hr />
              </div>
            ))}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default PostOfSharedPost;
