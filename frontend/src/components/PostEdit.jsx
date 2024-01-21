import React from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { useUpdatePostMutation } from '../slices/postsApiSlice';
import { toast } from 'react-toastify';

const PostEdit = ({
  postContent,
  postId,
  setPostContent,
  setShowModal,
  refetch,
  showModal,
  handleCloseModal,
}) => {
  //
  const [updatePost] = useUpdatePostMutation();

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

  return (
    <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
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
            onChange={(e) => setPostContent(e.target.value)}
          ></Form.Control>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PostEdit;
