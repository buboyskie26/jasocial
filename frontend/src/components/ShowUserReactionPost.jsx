// ShowUserReactionPost.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ShowUserReactionPost = ({
  showModalReactions,
  handleClose,
  selectedSamples,
}) => {
  return (
    <Modal show={showModalReactions} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>User react to a post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedSamples.map((sample, index) => (
          <div key={sample._id}>
            <p>
              Name: {sample.name} <span>Like</span>{' '}
            </p>
            <p>Email: {sample.email}</p>
            <p>
              <Button variant="primary">Add Friend</Button>
            </p>
            <hr />
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default ShowUserReactionPost;
