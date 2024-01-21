import asyncHandler from '../middleware/asyncHandler.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

const getAllFeedPost = asyncHandler(async (req, res) => {
  //
  const user = await User.findById(req.user._id).populate('friends.user');

  if (user) {
    // Sorting createdAt in DESC Order
    user.friends.sort((a, b) => b.requestSent - a.requestSent);
    const sortedFriendsArray = user.friends;

    // console.log(sortedFriendsArray);
    // res.send(user);
    // return;

    const loggedInUserFriends = sortedFriendsArray.filter(
      (friend) => friend.isAccepted === true
    );

    // Get All Friends Post First then merge all your posts

    const allUsers = loggedInUserFriends.map((friend) => ({
      userId: friend.user._id,
    }));

    // Use Promise.all to fetch posts for all users in parallel

    const allPostsPromises = allUsers.map(async (user) => {
      // const userPosts = await Post.find({ postedBy: user.userId });

      // Consider only the other friends posts by its postedBy
      const userPosts = await Post.find({
        postedBy: { $in: [user.userId] },
      })
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
        });

      return { userId: user.userId, posts: userPosts };
    });

    // Wait for all promises to resolve
    const allPosts = await Promise.all(allPostsPromises);

    const postsArrays = allPosts.map((userPosts) => userPosts.posts);

    // Now `postsArrays` is an array containing all the posts arrays

    // FROM [[Object]] into [Object]
    const flattenedArray = postsArrays.flat();
    // console.log(flattenedArray);

    // Get all loggedInUserPosts.

    const userLoggedInPosts = await Post.find({
      postedBy: req.user._id,
    })
      .populate('sharePost')
      .populate('postedBy')
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
      });

    // res.send(userLoggedInPosts);

    if (flattenedArray.length > 0 || userLoggedInPosts.length > 0) {
      // Merge
      const mergePost = [...flattenedArray, ...userLoggedInPosts];

      mergePost.sort((a, b) => b.createdAt - a.createdAt);

      res.status(201).json(mergePost);
    } else {
      res.status(400).json({
        message:
          'Your news feed is empty. Please add some friend or Create a post',
      });
    }
  }
});

const getMyAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find({ postedBy: req.user._id })
    .populate('sharePost')
    .sort({
      createdAt: 'desc',
    });

  if (allPosts) {
    res.status(200).json(allPosts);
  } else {
    res.status(401);
    throw new Error('Getting all my post went wrong.');
  }
});

// Post 1 = 2 Shared Post
// Get those 2 post who shared the Post 1

const getPostsOfSharedPost = asyncHandler(async (req, res) => {
  // const { postId } = req.body;
  const { postId } = req.params;

  const getPostsWhoShared = await Post.find({
    'sharePost.postShared': postId,
  })
    .populate('postedBy')
    .populate('sharePost.postShared')
    .populate('sharePost.user')
    .sort({
      createdAt: 'desc',
    });

  if (getPostsWhoShared) {
    res.status(200).json(getPostsWhoShared);
  } else {
    res.status(401);
    throw new Error('Getting all shared post error.');
  }
});

const getSinglePost = asyncHandler(async (req, res) => {
  const allPosts = await Post.find({ _id: req.params.postId })
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
    .populate({
      path: 'images.comments',
      populate: {
        path: 'user',
        model: 'User', // Assuming the model for the user is named 'User'
      },
    })
    .populate('postedBy')
    .populate('commentsPost.commentBy');

  if (allPosts) {
    res.status(200).json(allPosts);
  } else {
    res.status(401);
    throw new Error('Getting all my post went wrong.');
  }
});

const addPostContent = asyncHandler(async (req, res) => {
  //
  // imagesUploads is an array of string.
  const { content, imagesUploads } = req.body;

  // Map the array of image URLs to the structure expected by the schema
  const imagesData = imagesUploads.map((url) => ({
    url_image: url,
    comments: [],
  }));

  const createdPost = await Post.create({
    content,
    postedBy: req.user._id,
    // images: imagesUploads,
    images: imagesData,
  });

  if (createdPost) {
    res.status(200).json(createdPost);
  } else {
    res.status(401);
    throw new Error('Couldnt add a post');
  }
});

const addCommentToPostImage = asyncHandler(async (req, res) => {
  //
  // imagesUploads is an array of string.
  const { comment } = req.body;
  const { imageId, postId } = req.params;

  const getPost = await Post.findOne({
    _id: postId,
    // images: images.findIndex((w) => w.url_image.equals(imageId)),
  });

  if (getPost) {
    const postImageIndex = getPost.images.findIndex((w) =>
      w._id.equals(imageId)
    );
    if (postImageIndex !== -1) {
      getPost.images[postImageIndex].comments.push({
        comment: comment,
        user: req.user._id,
      });

      const updatedPostImageComment = await getPost.save();

      if (updatedPostImageComment) {
        res.status(200).json(getPost);
      } else {
        res.status(401);
        throw new Error('Couldnt add an comment on a post image');
      }
    }
  } else {
    res.status(401).json({ message: "Could'nt get the post" });
  }
});

const updateCommentToPostImage = asyncHandler(async (req, res) => {
  //
  // imagesUploads is an array of string.
  const { comment } = req.body;
  const { imageId, postId, commentId } = req.params;

  const getPost = await Post.findOne({
    _id: postId,
    // images: images.findIndex((w) => w.url_image.equals(imageId)),
  });

  if (getPost) {
    const postImageIndex = getPost.images.findIndex((w) =>
      w._id.equals(imageId)
    );

    if (postImageIndex !== -1) {
      // Assuming your `comments` is an array field inside the `images` array
      const commentIndex = getPost.images[postImageIndex].comments.findIndex(
        (c) => c._id.equals(commentId) && c.user.equals(req.user._id)
      );

      if (commentIndex !== -1) {
        // Update the comment content
        getPost.images[postImageIndex].comments[commentIndex].comment = comment;

        const updatedPostImageComment = await getPost.save();

        if (updatedPostImageComment) {
          res.status(200).json(getPost);
        } else {
          res.status(401);
          throw new Error('Couldnt add an comment on a post image');
        }
      }
    } else {
      res.status(401).json({ message: "Could'nt get the post" });
    }
  }
});

const removeCommentToPostImage = asyncHandler(async (req, res) => {
  //
  const { imageId, postId, commentId } = req.params;

  const getPost = await Post.findOne({
    _id: postId,
    // images: images.findIndex((w) => w.url_image.equals(imageId)),
  });

  if (getPost) {
    const postImageIndex = getPost.images.findIndex((w) =>
      w._id.equals(imageId)
    );

    if (postImageIndex !== -1) {
      // res.send(getPost);
      // return;

      // Assuming your `comments` is an array field inside the `images` array
      const commentIndex = getPost.images[postImageIndex].comments.findIndex(
        (c) => c._id.equals(commentId) && c.user.equals(req.user._id)
      );

      if (commentIndex !== -1) {
        // Update the comment content
        // getPost.images[postImageIndex].comments[commentIndex].splice(0, 1);
        getPost.images[postImageIndex].comments.splice(commentIndex, 1);

        const updatedPostImageComment = await getPost.save();

        if (updatedPostImageComment) {
          res.status(200).json({
            message: 'Comment on a post has been successfully removed.',
          });
        } else {
          res.status(401);
          throw new Error('Couldnt add an comment on a post image');
        }
      } else {
        res
          .status(401)
          .json({ message: "Could'nt get the comment index on a post" });
      }
    } else {
      res.status(401).json({ message: "Could'nt get the comment on a post" });
    }
  }
});

const getCommentsToPostImage = asyncHandler(async (req, res) => {
  //
  // imagesUploads is an array of string.
  const { imageId, postId } = req.params;

  const getPost = await Post.findOne({
    _id: postId,
    // images: images.findIndex((w) => w.url_image.equals(imageId)),
  }).populate({
    path: 'images.comments',
    populate: {
      path: 'user',
      model: 'User', // Assuming the model for the user is named 'User'
    },
  });

  if (getPost) {
    const postImageIndex = getPost.images.findIndex((w) =>
      w._id.equals(imageId)
    );

    if (postImageIndex !== -1) {
      const postImagesComments = getPost.images[postImageIndex].comments;
      res.status(200).json(postImagesComments);
    }

    res
      .status(401)
      .json({ message: "Could'nt get the post image comment section." });
  }
});

const updatePostContent = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;

  try {
    // console.log('Request Payload:', req.body);
    // console.log('Post ID:', postId);
    // console.log('User ID:', req.user._id);

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, postedBy: req.user._id.toString() },
      { $set: { content } },
      { new: true }
    );

    if (!updatedPost) {
      // console.log('Post not found or You`re updating post from other');
      res
        .status(404)
        .json({ message: 'Post not found or You`re updating post from other' });
      return;
    }

    // console.log('Updated Post:', updatedPost);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  // Use findByIdAndDelete for removing a document by its _id
  const post = await Post.findOneAndDelete({
    _id: postId,
    postedBy: req.user._id.toString(),
  });

  if (!post) {
    // Use status(404) for resource not found
    res.status(404).json({
      message: `No Post with id: ${postId} or You're removing others post.`,
    });
    return;
  }

  res.status(200).json({ msg: 'Success! Post removed.' });
});

const addCommentToPost = asyncHandler(async (req, res) => {
  //
  const { body } = req.body;
  const postId = req.params.postId;

  const getPost = await Post.findOne({ _id: postId });

  if (!getPost) {
    res.status(401);
    throw new Error('Post not found');
  }

  const newComment = {
    body,
    commentBy: req.user._id,
    post: postId,
  };

  getPost.commentsPost.push(newComment);
  const updatedPost = await getPost.save();

  if (updatedPost) {
    res.status(200).json({
      message: 'You have successfully provided a comment on the post',
    });
  } else {
    res.status(401);
    throw new Error('Could`nt add a comment to a post');
  }
});

const updateCommentToPost = asyncHandler(async (req, res) => {
  //
  const { body } = req.body;
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const getPost = await Post.findOne({ _id: postId });

  if (!getPost) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  const commentIndex = getPost.commentsPost.findIndex(
    (x) =>
      x._id.toString() === commentId.toString() &&
      x.post.toString() === postId.toString()
  );

  if (commentIndex === -1) {
    res
      .status(401)
      .json({ message: 'You are trying to update a comment of others.' });
    return;
  }

  getPost.commentsPost[commentIndex].body = body;

  const updatedComment = await getPost.save();

  if (updatedComment) {
    // res.status(200).json({
    //   message: 'You have successfully updated your comment on a post',
    // });
    res.status(200).json(getPost);
  } else {
    res
      .status(500)
      .json({ message: 'Failed to update the comment on the post' });
  }
});

const deleteCommentToPost = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const postId = req.params.postId;

  const getPost = await Post.findOne({ _id: postId });
  if (!getPost) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Filter out the comment to be removed
  // Returns an array of commentsPost ( but the chosen commentId has been removed.)
  const updatedComments = getPost.commentsPost.filter(
    (comment) =>
      comment._id.toString() !== commentId.toString() ||
      comment.post.toString() !== postId.toString()
  );

  // Check if any comment was removed
  //  if (updatedComments.length === getPost.commentsPost.length) {
  //    return res
  //      .status(401)
  //      .json({ message: 'You are trying to remove a comment of others.' });
  //  }

  // Update the post's comments array with the filtered array
  getPost.commentsPost = updatedComments;

  try {
    // Save the post with the updated comments array
    const doesSave = await getPost.save();

    if (doesSave) {
      // Respond with success message
      res.status(200).json({
        message: 'You have successfully removed the comment from the post',
      });
    }
  } catch (error) {
    // Handle errors during the save operation
    // console.error(error);
    res
      .status(500)
      .json({ message: 'Failed to remove the comment from the post' });
  }
});

const sharePost = asyncHandler(async (req, res) => {
  try {
    // Find the original post by postId
    const originalPost = await Post.findById(req.params.postId);

    if (!originalPost) {
      res.status(404).json({ message: 'Original post not found' });
      return;
    }

    // Create a new post with shared content
    const sharedPost = new Post({
      content: req.body.content, // Assuming content is in the request body
      postedBy: req.user._id, // Assuming the user is authenticated and their ID is in req.user
      sharePost: {
        postShared: originalPost._id,
        // sharedPostContent: req.body.sharedPostContent,
        user: req.user._id,
      },
    });

    // Save the shared post
    const savedPost = await sharedPost.save();

    // Optionally, update the original post with the shared post ID
    // originalPost.sharePost.push(savedPost._id);
    await originalPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const sharingASharedPost = asyncHandler(async (req, res) => {
  try {
    // Find the original post by postId
    const originalPost = await Post.findById(req.params.postId);

    if (!originalPost) {
      res.status(404).json({ message: 'Original post not found' });
      return;
    }

    // console.log(originalPost);
    // return;

    // Create a new post with shared content

    const sharedPost = new Post({
      content: req.body.content, // Assuming content is in the request body
      postedBy: req.user._id, // Assuming the user is authenticated and their ID is in req.user
      sharePost: {
        postShared: originalPost.sharePost.postShared,
        // sharedPostContent: req.body.sharedPostContent,
        user: req.user._id,
      },
    });

    // Save the shared post
    const savedPost = await sharedPost.save();

    // Optionally, update the original post with the shared post ID
    // originalPost.sharePost.push(savedPost._id);
    await originalPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const getAllFriendPost = asyncHandler(async (req, res) => {
  //
  const userId = req.params.userId;
  const user = await User.findById(req.user._id).populate('friends.user');

  if (user) {
    // const hasIndex = user.friends.findIndex(
    //   (w) => w.user === userId.toString()
    // );

    const friendIndex = user.friends.findIndex((friend) =>
      friend.user.equals(userId.toString())
    );

    if (friendIndex !== -1) {
      // console.log(hasIndex);
      // res.status(200).send('Has Index');
      // $$

      const allPosts = await Post.find({ postedBy: userId.toString() });

      if (allPosts) {
        res.status(200).json(allPosts);
      }
    } else {
      res.status(404);
      throw new Error('You can only view user post if it is your friend.');
    }
  }
});

const addUpdateReactionToPost = asyncHandler(async (req, res) => {
  //
  //
  const { type: postReaction } = req.body;

  const postId = req.params.postId;
  const userId = req.user._id; // Assuming you have the user's ID in the request

  const getPost = await Post.findOne({ _id: postId });

  if (!getPost) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  // Check if the user has already reacted
  const existingReaction = getPost.reaction.find(
    (reaction) =>
      reaction.user.equals(userId.toString()) &&
      reaction.type === postReaction.toString()
  );

  const reactionIndex = getPost.reaction.findIndex((reaction) =>
    reaction.user.equals(userId.toString())
  );

  let type_status = null;

  // SCENARIO
  // If User react as like in a post, and attempt to  react again with 'heart'
  // then, that like should UPDATE into heart

  // If User react as like in a post, and attempt to  react again with 'like'
  // then, no action should be made.

  if (reactionIndex !== -1) {
    // update the reaction type.
    // getPost.reaction[reactionIndex].type = postReaction;
    getPost.reaction[reactionIndex].set({ type: postReaction });
    type_status = 'update';
  } else {
    getPost.reaction.push({ type: postReaction.toString(), user: userId });
    type_status = 'create';
  }

  const updatedPost = await getPost.save();

  if (updatedPost) {
    if (type_status === 'update') {
      res.status(200).json({
        message: `You have successfully reacted with ${postReaction} on a post`,
      });
    } else {
      res.status(200).json({
        message: `You have successfully change your reaction with ${postReaction} on a post`,
      });
    }
  } else {
    res.status(500).json({ message: 'Failed to update the post' });
  }

  //
});

const removingReactionToPost = asyncHandler(async (req, res) => {
  //
  const postId = req.params.postId;
  const userId = req.user._id;

  const getPost = await Post.findOne({ _id: postId });

  if (!getPost) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  const reactionIndex = getPost.reaction.findIndex((reaction) =>
    reaction.user.equals(userId.toString())
  );

  if (reactionIndex !== -1) {
    // getPost.reaction[reactionIndex].set({ type: postReaction });
    getPost.reaction.splice(reactionIndex, 1);
  }

  const updatedPost = await getPost.save();

  if (updatedPost) {
    res.status(200).json({
      message: `You have successfully remove your reaction on a post`,
    });
  } else {
    res
      .status(500)
      .json({ message: 'Failed to remove the reaction to a post' });
  }

  //
});

const getComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  const getPost = await Post.findOne({ _id: postId });

  if (!getPost) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  // Check if the user has already reacted
  const existingReaction = getPost.commentsPost.find((comment) =>
    comment._id.equals(commentId.toString())
  );
  if (existingReaction !== undefined) {
    res.status(200).send(existingReaction);
  } else {
    res
      .status(500)
      .json({ message: 'No comment Id found in provided post Id' });
  }
});

export {
  getMyAllPosts,
  addPostContent,
  sharePost,
  sharingASharedPost,
  getSinglePost,
  addCommentToPost,
  updateCommentToPost,
  deleteCommentToPost,
  updatePostContent,
  deletePost,
  getAllFriendPost,
  getAllFeedPost,
  addUpdateReactionToPost,
  removingReactionToPost,
  getComment,
  getPostsOfSharedPost,
  addCommentToPostImage,
  updateCommentToPostImage,
  getCommentsToPostImage,
  removeCommentToPostImage,
};
