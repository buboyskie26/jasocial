import { apiSlice } from './apiSlice';
import { POSTS_URL, UPLOAD_URL } from '../constants';

export const postsApiSlice = apiSlice.injectEndpoints({
  //
  // All endpoint should comes from the backend route.
  endpoints: (builder) => ({
    getSingleComment: builder.query({
      query: (data) => ({
        url: `${POSTS_URL}/comment/${data.commentId}/${data.postId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    getAllMyPost: builder.query({
      query: () => ({
        url: `${POSTS_URL}/myPost`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Posts'],
    }),
    getAllFeedPost: builder.query({
      query: () => ({
        url: `${POSTS_URL}/feedPost`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Posts'],
    }),
    getSinglePost: builder.query({
      query: (postId) => ({
        url: `${POSTS_URL}/${postId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getPostsOfSharedPost: builder.query({
      query: (postId) => ({
        url: `${POSTS_URL}/sharedPosts/${postId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getPostImageComments: builder.query({
      query: (data) => ({
        url: `${POSTS_URL}/getPostImageComments/${data.imageId}/${data.postId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    addCommentToPost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/comment/${data.postId}`,
        method: 'POST',
        body: { ...data },
      }),
      invalidatesTags: ['Post'],
    }),

    editCommentToPost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/comment/${data.postId}/${data.commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
    deleteCommentToPost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/comment/${data.postId}/${data.commentId}`,
        method: 'DELETE',
      }),
      providesTags: ['Product'],
    }),
    updatePost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/${data.postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
    addPost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    deletePost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/${data.postId}`,
        method: 'DELETE',
      }),
      providesTags: ['Post'],
    }),
    // removingReactionToPost
    addPostLike: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/addReaction/${data.postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    deletePostLike: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/removeReaction/${data.postId}`,
        method: 'PUT',
      }),
      providesTags: ['Post'],
    }),
    deleteCommentOnPostImage: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/removeCommentToPostImage/${data.imageId}/${data.postId}/${data.commentId}`,
        method: 'PUT',
      }),
      providesTags: ['Post'],
    }),
    sharePost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/${data.postId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),

    sharingASharedPost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/${data.postId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: 'POST',
        body: data,
      }),
      // invalidatesTags: ['Products'],
    }),

    addCommentToImagePost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/addCommentToPostImage/${data.imageId}/${data.postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
    updateCommentToImagePost: builder.mutation({
      query: (data) => ({
        url: `${POSTS_URL}/updateCommentToPostImage/${data.imageId}/${data.postId}/$${data.commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const {
  useGetAllMyPostQuery,
  useGetAllFeedPostQuery,
  useGetSinglePostQuery,
  useGetSingleCommentQuery,
  useGetPostsOfSharedPostQuery,
  useGetPostImageCommentsQuery,
  useAddCommentToPostMutation,
  useEditCommentToPostMutation,
  useDeleteCommentToPostMutation,
  useUpdatePostMutation,
  useAddPostMutation,
  useAddPostLikeMutation,
  useDeletePostMutation,
  useDeletePostLikeMutation,
  useSharePostMutation,
  useSharingASharedPostMutation,
  useUploadProductImageMutation,
  useAddCommentToImagePostMutation,
  useUpdateCommentToImagePostMutation,
  useDeleteCommentOnPostImageMutation
} = postsApiSlice;
