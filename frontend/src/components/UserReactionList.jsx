import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const UserReactionList = ({ user, onHide }) => {
  console.log(user);
  return (
    <>
      <div className="left-content">
        <img src={'https://i.imgur.com/RpzrMR2.jpg'} alt={'Profile'} />
        <p>{user._id}</p>
      </div>
      <div className="right-content">
        <Button variant="primary" onClick={onHide}>
          Add Friend
        </Button>
      </div>
    </>
  );
};

export default UserReactionList;
