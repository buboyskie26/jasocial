import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const userApiSlice = apiSlice.injectEndpoints({
  //
  // All endpoint should comes from the backend route.
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    getSingleUser: builder.query({
      query: (data) => ({
        url: `${USERS_URL}/getUser/${data.userId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Users'],
    }),
    getSingleProfile: builder.query({
      query: (data) => ({
        url: `${USERS_URL}/getProfile/${data.userId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Users'],
    }),
    setToLoggedIn: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/setToLoggedIn/${data.userId}`,
        method: 'PUT',
      }),
      providesTags: ['User'],
    }),
    setToLoggedOut: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/setToLoggedOut/${data.userId}`,
        method: 'PUT',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetSingleUserQuery,
  useGetSingleProfileQuery,
  useLoginMutation,
  useLogoutMutation,
  useSetToLoggedInMutation,
  useSetToLoggedOutMutation,
} = userApiSlice;
