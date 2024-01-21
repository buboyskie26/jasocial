import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {
    // Compare Password
    //  res.send('match');

    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isLoggedIn: user.isLoggedIn,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    res.status(401);
    throw new Error('Email is already taken');
  }

  const userCreate = await User.create({
    name,
    email,
    password,
  });

  if (userCreate) {
    generateToken(res, userCreate._id);
    res.status(200).json({
      _id: userCreate._id,
      name,
      email,
      isAdmin: userCreate.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Something went wrong on creating user');
  }
});

const logoutUser = (req, res) => {
  // if (req.user._id) {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
  // }
};

const addFriendToUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId });
    const userLoggedIn = await User.findOne({ _id: req.user._id });

    if (user) {
      // Check if the user is already a friend
      const isAlreadyFriend = user.friends.some((friend) =>
        friend.user.equals(userId)
      );
      if (isAlreadyFriend) {
        res.status(400).json({ message: 'User is already your friend' });
        return;
      }

      // Add the friend to the user's friends array
      user.friends.push({
        user: req.user._id,
        isAccepted: false,
        initiateRequest: false,
      });

      //
      userLoggedIn.friends.push({
        user: userId,
        isAccepted: false,
        initiateRequest: true,
      });

      // user.friends = user.friends.map((friend) => ({
      //   ...friend,
      //   isAccepted: false,
      //   user: userId,
      //   _id: undefined,
      // }));

      // Save the user document
      await user.save();
      await userLoggedIn.save();

      res
        .status(200)
        .json({ message: 'Friend request has successfully added' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getAllMyFriendRequestsFromOther = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends.user');

  // console.log(user);
  // const sortedFriendsArray = user.friends.sort({ createdAt: -1 });

  if (user) {
    // Sorting createdAt in DESC Order
    user.friends.sort((a, b) => b.requestSent - a.requestSent);
    const sortedFriendsArray = user.friends;
    const loggedInUserFriendRequests = sortedFriendsArray.map((w) => ({
      _id: w.user._id,
      name: w.user.name,
      email: w.user.email,
      isAccepted: w.isAccepted,
      requestSent: w.requestSent,
    }));

    res.status(201).json(loggedInUserFriendRequests);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }

  // console.log(usersWithFriendship);
});

// All users that request a friend request to me

const getAllMyFriendRequestsToOther = asyncHandler(async (req, res) => {
  // Operation is expensive. It should get ALL USERS

  const usersWithFriendship = await User.find({
    friends: {
      $elemMatch: {
        user: req.user._id,
      },
    },
  }).sort({ createdAt: -1 });

  if (usersWithFriendship.length > 0) {
    const usersISentFriendRequests = usersWithFriendship.map((w) => ({
      _id: w._id,
      name: w.name,
      email: w.email,
      isAccepted: w.friends[0].isAccepted,
      requestSent: w.friends[0].requestSent,
    }));

    res.status(201).json(usersISentFriendRequests);
  } else {
    res.status(404).json({ message: 'Friend request to other not found.' });
  }

  // console.log(usersWithFriendship);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends.user');

  // console.log(user);
  // const sortedFriendsArray = user.friends.sort({ createdAt: -1 });

  if (user) {
    // Sorting createdAt in DESC Order
    user.friends.sort((a, b) => b.requestSent - a.requestSent);
    const sortedFriendsArray = user.friends;
    const loggedInUserFriendRequests = sortedFriendsArray.map((w) => ({
      _id: w.user._id,
      name: w.user.name,
      email: w.user.email,
      isAccepted: w.isAccepted,
      requestSent: w.requestSent,
    }));

    res.status(201).json(loggedInUserFriendRequests);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }

  // console.log(usersWithFriendship);
});

// const getFriendRequestOfInitiatedUser = asyncHandler(async (req, res) => {
//   //
//   const userInitiated = await User.findOne({
//     _id: req.user._id,
//     // friends: { $elemMatch: { initiateRequest: true } },
//   });

//   // res.send(userInitiated);
//   // return;
//   if (userInitiated) {
//     const usersISentFriendRequests = userInitiated.friends
//       .filter((friend) => friend.initiateRequest === true)
//       .map((friend) => ({
//         _id: friend.user._id, // Assuming friend.user._id is the correct path to user ID
//         name: friend.user.name,
//         email: friend.user.email,
//         isAccepted: friend.isAccepted,
//         requestSent: friend.requestSent,
//         initiateRequest: friend.initiateRequest,
//       }));

//     if (usersISentFriendRequests.length > 0) {
//       res.status(201).json(usersISentFriendRequests);
//     } else {
//       res
//         .status(404)
//         .json({ message: 'No friends with initiateRequest true found.' });
//     }
//   } else {
//     res.status(404).json({ message: 'Friend request to others not found.' });
//   }
// });

// const getFriendRequestOfUnInitiatedUser = asyncHandler(async (req, res) => {
//   //
//   const userInitiated = await User.findOne({
//     _id: req.user._id,
//   });

//   // res.send(userInitiated);
//   // return;
//   if (userInitiated) {
//     const usersISentFriendRequests = userInitiated.friends
//       .filter((friend) => friend.initiateRequest === false)
//       .map((friend) => ({
//         _id: friend.user._id, // Assuming friend.user._id is the correct path to user ID
//         name: friend.user.name,
//         email: friend.user.email,
//         isAccepted: friend.isAccepted,
//         requestSent: friend.requestSent,
//         initiateRequest: friend.initiateRequest,
//       }));

//     if (usersISentFriendRequests.length > 0) {
//       res.status(201).json(usersISentFriendRequests);
//     } else {
//       res
//         .status(404)
//         .json({ message: 'No friends with initiateRequest false found.' });
//     }
//   } else {
//     res.status(404).json({ message: 'Friend request to others not found.' });
//   }
// });

const getUserFriendRequests = async (userId, initiateRequest) => {
  const userInitiated = await User.findOne({ _id: userId });

  if (!userInitiated) {
    return { status: 404, message: 'User not found.' };
  }

  const filteredFriends = userInitiated.friends
    .filter((friend) => friend.initiateRequest === initiateRequest)
    .map((friend) => ({
      _id: friend.user._id,
      name: friend.user.name,
      email: friend.user.email,
      isAccepted: friend.isAccepted,
      requestSent: friend.requestSent,
      initiateRequest: friend.initiateRequest,
    }));

  if (filteredFriends.length > 0) {
    return { status: 200, data: filteredFriends };
  } else {
    return {
      status: 404,
      message: `No friends with initiateRequest ${initiateRequest} found.`,
    };
  }
};

const getFriendRequestOfInitiatedUser = asyncHandler(async (req, res) => {
  const result = await getUserFriendRequests(req.user._id, true);
  res.status(result.status).json(result.data || { message: result.message });
});

const getFriendRequestOfUnInitiatedUser = asyncHandler(async (req, res) => {
  const result = await getUserFriendRequests(req.user._id, false);
  res.status(result.status).json(result.data || { message: result.message });
});

//  Accepting friend request coming from others.

const acceptFriendRequest = asyncHandler(async (req, res) => {
  //  Coming from users who sent a request to you
  const userId = req.params.userId;

  try {
    const userLoggedIn = await User.findOne({ _id: req.user._id });
    const userInsistedRequest = await User.findOne({ _id: userId });

    if (userLoggedIn && userInsistedRequest) {
      // Check if the friend exists in the user's friends array
      const userLoggedInFriendIndex = userLoggedIn.friends.findIndex((friend) =>
        friend.user.equals(userId.toString())
      );

      const userInsistedFriendIndex = userInsistedRequest.friends.findIndex(
        (friend) => friend.user.equals(req.user._id.toString())
      );

      if (userInsistedFriendIndex !== -1) {
        // Updating user who insisted the friend requests from userLoggedIn

        userInsistedRequest.friends[userInsistedFriendIndex].set({
          isAccepted: true,
        });

        // Save the user document
        await userInsistedRequest.save();

        // res.status(200).json({ message: 'Friend successfully accepted.' });
      }

      if (userLoggedInFriendIndex !== -1) {
        // Accepting the friend request from the usersLoggedIn friends array
        // userLoggedIn.friends[userLoggedInFriendIndex].isAccepted = true;
        userLoggedIn.friends[userLoggedInFriendIndex].set({ isAccepted: true });

        // Save the user document
        await userLoggedIn.save();

        res.status(200).json({ message: 'Friend successfully accepted.' });
      } else {
        res
          .status(404)
          .json({ message: 'Friend not found in your friends list' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deletingFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: req.user._id });

    if (user) {
      // Check if the friend exists in the user's friends array
      const friendIndex = user.friends.findIndex(
        (friend) => friend.user.equals(userId) && friend.isAccepted === false
      );

      // console.log(friendIndex);

      if (friendIndex !== -1) {
        // console.log(user.friends[friendIndex]);
        const userIDToRemove = user.friends[friendIndex].user;

        console.log(userIDToRemove);

        // // Remove the friend from the user's friends array
        user.friends.splice(friendIndex, 1);

        // // Save the user document
        await user.save();

        res.status(200).json({
          message: `Friend request ID:${userIDToRemove} has been successfully removed`,
        });
      } else {
        res
          .status(404)
          .json({ message: 'Friend not found in your friends list' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getSingleUser = asyncHandler(async (req, res) => {
  // Operation is expensive. It should get ALL USERS

  const userFound = await User.findOne({
    _id: req.params.userId,
  });

  if (userFound) {
    res.status(201).json(userFound);
  } else {
    res.status(404).json({ message: 'User is not found.' });
  }

  // console.log(usersWithFriendship);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const allPosts = await Post.find({ postedBy: req.params.userId })
    .populate('sharePost')
    .populate('postedBy')
    .populate('reaction')
    .populate('reaction.user')

    .populate('sharePost')
    .populate('sharePost.user')
    .populate('sharePost.postShared')
    .populate({
      path: 'sharePost.postShared',
      populate: {
        path: 'postedBy',
        model: 'User', // Assuming the model for the user is named 'User'
      },
    })
    .sort({
      createdAt: 'desc',
    });

  if (allPosts) {
    res.status(200).json(allPosts);
  } else {
    res.status(401);
    throw new Error('Get user profil error.');
  }
});

const setUserState = asyncHandler(async (userId, setTo, message) => {
  try {
    const user = await User.findOne({ _id: userId });

    if (user) {
      // Set the user's isLoggedIn property to true
      user.isLoggedIn = setTo;

      // Save the changes
      await user.save();

      return {
        status: 200,
        data: { message: message },
      };
    } else {
      return {
        status: 404,
        data: { message: 'User not found' },
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      data: { message: 'Internal Server Error' },
    };
  }
});

const setUserLoggedIn = asyncHandler(async (req, res) => {
  const result = await setUserState(
    req.params.userId,
    true,
    'User status is now set to logged in'
  );
  res.status(result.status).json(result.data || { message: result.message });
});
const setUserLoggedOut = asyncHandler(async (req, res) => {
  const result = await setUserState(
    req.params.userId,
    false,
    'User status is now set to logged out'
  );
  res.status(result.status).json(result.data || { message: result.message });
});
export {
  authUser,
  registerUser,
  logoutUser,
  addFriendToUser,
  deletingFriendRequest,
  getAllMyFriendRequestsToOther,
  acceptFriendRequest,
  getAllMyFriendRequestsFromOther,
  getFriendRequestOfInitiatedUser,
  getFriendRequestOfUnInitiatedUser,
  getSingleUser,
  getUserProfile,
  setUserLoggedIn,
  setUserLoggedOut,
};
