//
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';

import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import { setCredentials } from '../slices/authSlice';
import {
  useLoginMutation,
  useSetToLoggedInMutation,
} from '../slices/usersApiSlice';
import { BASE_URL } from '../constants';

import io from 'socket.io-client';
// const socket = io('http://localhost:5000'); // Replace with your server URL
const socket = io(`${BASE_URL}`); // Replace with your server URL

const LoginScreen = () => {
  //
  const [email, setEmail] = useState('john@email.com');
  const [password, setPassword] = useState('123456');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const [setToLoggedIn] = useSetToLoggedInMutation();
  // isLoading = true;

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const submitHandler = async (e) => {
    console.log(email);
    console.log(password);

    e.preventDefault();
    try {
      // Route coming from the backend
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));

      // Update the user as Logged In in the Database.
      await setToLoggedIn({ userId: res._id }).unwrap();

      dispatch(setCredentials({ ...res }));
      socket.emit('update_online_user', {
        onlineUserId: res._id,
      });

      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <FormContainer>
      <h1>Sign In</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button disabled={isLoading} type="submit" variant="primary">
          Sign In
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
