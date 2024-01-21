import { apiSlice } from './apiSlice';
import { MESSAGE_URL, UPLOAD_URL } from '../constants';

export const messagesApiSlice = apiSlice.injectEndpoints({
  // All endpoint should comes from the backend route.
  endpoints: (builder) => ({
    getAllSingleChatMessages: builder.query({
      query: (userId) => ({
        url: `${MESSAGE_URL}/getChatMessages/${userId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Messages'],
    }),
    getChatUsers: builder.query({
      query: () => ({
        url: `${MESSAGE_URL}/getChatUsers/`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Chats'],
    }),
    getChatObject: builder.query({
      query: (data) => ({
        url: `${MESSAGE_URL}/getChatObj/${data.chatId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Chats'],
    }),
    addMessageToOneUser: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/${data.userId}`,
        method: 'POST',
        body: { ...data },
      }),
      invalidatesTags: ['Message'],
    }),
    addChatToUser: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/autoAddChat/${data.userId}`,
        method: 'POST',
        body: { ...data },
      }),
      invalidatesTags: ['Chat'],
    }),
    unsentMessage: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/unsentMessage/${data.messageId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),
    addMessageReaction: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/addReaction/${data.messageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),
    addReplyMessage: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/replyToUserMessage/${data.messageId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),
    removeMessageReaction: builder.mutation({
      query: (data) => ({
        url: `${MESSAGE_URL}/removeReaction/${data.messageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Message'],
    }),
    uploadMessageImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: 'POST',
        body: data,
      }),
      // invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetAllSingleChatMessagesQuery,
  useGetChatUsersQuery,
  useGetChatObjectQuery,
  useAddMessageToOneUserMutation,
  useUnsentMessageMutation,
  useAddMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useAddReplyMessageMutation,
  useUploadMessageImageMutation,
  useAddChatToUserMutation,
} = messagesApiSlice;
