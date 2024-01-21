import React from 'react';
import {
  Navbar,
  Nav,
  Container,
  Badge,
  NavDropdown,
  Dropdown,
} from 'react-bootstrap';
import {
  FaFacebookMessenger,
  FaShoppingCart,
  FaUber,
  FaUser,
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useLogoutMutation,
  useSetToLoggedOutMutation,
} from '../slices/usersApiSlice';
import { removeCredentials } from '../slices/authSlice';

import io from 'socket.io-client';
import HeaderChatDropdown from './HeaderChatDropdown';
const socket = io('http://localhost:5000'); // Replace with your server URL
const Header = () => {
  //
  // const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // console.log(cartItems);
  const [logoutApiCall, { isLoading }] = useLogoutMutation();
  const [setToLoggedOut] = useSetToLoggedOutMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();

      await setToLoggedOut({ userId: userInfo._id }).unwrap();
      socket.emit('update_online_user', {
        onlineUserId: userInfo._id,
      });
      dispatch(removeCredentials());
      navigate('/login');
    } catch (err) {
      console.log(err.error);
    }
  };

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img src={logo} alt="Mini-social" />
              Mini-social
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  <HeaderChatDropdown />
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
