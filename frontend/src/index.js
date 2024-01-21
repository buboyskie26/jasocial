import React from 'react';
import ReactDOM from 'react-dom/client';

// import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import PostScreen from './screens/PostScreen';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Router,
  RouterProvider,
} from 'react-router-dom';

import store from './store';
import { Provider } from 'react-redux';
import LoginScreen from './screens/LoginScreen';
import SinglePost from './screens/SinglePost';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import ProfileScreen from './screens/ProfileScreen';
import MessageScreen from './screens/MessageScreen';
import PostImageScreen from './screens/PostImageScreen';
import SampleScreen from './screens/SampleScreen';
import TestScreen from './screens/TestScreen';
import ChatMessages from './components/ChatMessages';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route index={true} path="/login" element={<LoginScreen />} />

      <Route path="" element={<AuthenticatedRoute />}>
        <Route path="/" element={<PostScreen />} />
        <Route path="/:id" element={<SinglePost />} />
        <Route path="/profile/:userId" element={<ProfileScreen />} />
        <Route path="/:postId/photo/:imageId" element={<PostImageScreen />} />
        <Route path="/message/:userId" element={<MessageScreen />} />
        <Route path="/messages/" element={<ChatMessages />} />
        <Route path="/test" element={<TestScreen />} />
      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
