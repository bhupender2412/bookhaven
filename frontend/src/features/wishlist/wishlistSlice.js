import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/api";

import {
  logout,
} from "../auth/authSlice";

// --------------------------------------------------
// Fetch Wishlist
// --------------------------------------------------

export const fetchWishlist =
  createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, thunkAPI) => {
      try {
        const response =
          await api.get(
            "/wishlist"
          );

        return response.data
          .wishlist;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to load wishlist"
        );
      }
    }
  );

// --------------------------------------------------
// Add To Wishlist
// --------------------------------------------------

export const addToWishlist =
  createAsyncThunk(
    "wishlist/addToWishlist",
    async (
      bookId,
      thunkAPI
    ) => {
      try {
        const response =
          await api.post(
            `/wishlist/items/${bookId}`
          );

        return {
          wishlist:
            response.data
              .wishlist,

          message:
            response.data
              .message,
        };
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to add book to wishlist"
        );
      }
    }
  );

// --------------------------------------------------
// Remove From Wishlist
// --------------------------------------------------

export const removeFromWishlist =
  createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (
      bookId,
      thunkAPI
    ) => {
      try {
        const response =
          await api.delete(
            `/wishlist/items/${bookId}`
          );

        return {
          wishlist:
            response.data
              .wishlist,

          message:
            response.data
              .message,
        };
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to remove book from wishlist"
        );
      }
    }
  );

// --------------------------------------------------
// Clear Wishlist
// --------------------------------------------------

export const clearServerWishlist =
  createAsyncThunk(
    "wishlist/clearWishlist",
    async (_, thunkAPI) => {
      try {
        const response =
          await api.delete(
            "/wishlist"
          );

        return {
          wishlist:
            response.data
              .wishlist,

          message:
            response.data
              .message,
        };
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to clear wishlist"
        );
      }
    }
  );

const initialState = {
  books: [],
  count: 0,

  loading: false,
  actionLoading: false,
  initialized: false,

  error: "",
  message: "",
};

const wishlistSlice =
  createSlice({
    name: "wishlist",

    initialState,

    reducers: {
      clearWishlistFeedback: (
        state
      ) => {
        state.error = "";
        state.message = "";
      },

      resetWishlist: () =>
        initialState,
    },

    extraReducers: (
      builder
    ) => {
      // --------------------------------------------
      // Fetch
      // --------------------------------------------

      builder
        .addCase(
          fetchWishlist.pending,
          (state) => {
            state.loading = true;
            state.error = "";
          }
        )

        .addCase(
          fetchWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.initialized = true;

            state.books =
              action.payload.books ||
              [];

            state.count =
              action.payload.count ||
              0;

            state.error = "";
          }
        )

        .addCase(
          fetchWishlist.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.initialized = true;

            state.error =
              action.payload ||
              "Failed to load wishlist";
          }
        );

      // --------------------------------------------
      // Add
      // --------------------------------------------

      builder
        .addCase(
          addToWishlist.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          addToWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.books =
              action.payload
                .wishlist
                .books ||
              [];

            state.count =
              action.payload
                .wishlist
                .count ||
              0;

            state.message =
              action.payload
                .message ||
              "Book added to wishlist";

            state.error = "";
          }
        )

        .addCase(
          addToWishlist.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to add book";
          }
        );

      // --------------------------------------------
      // Remove
      // --------------------------------------------

      builder
        .addCase(
          removeFromWishlist.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          removeFromWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.books =
              action.payload
                .wishlist
                .books ||
              [];

            state.count =
              action.payload
                .wishlist
                .count ||
              0;

            state.message =
              action.payload
                .message ||
              "Book removed from wishlist";

            state.error = "";
          }
        )

        .addCase(
          removeFromWishlist.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to remove book";
          }
        );

      // --------------------------------------------
      // Clear
      // --------------------------------------------

      builder
        .addCase(
          clearServerWishlist.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          clearServerWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.books =
              action.payload
                .wishlist
                .books ||
              [];

            state.count =
              action.payload
                .wishlist
                .count ||
              0;

            state.message =
              action.payload
                .message ||
              "Wishlist cleared successfully";

            state.error = "";
          }
        )

        .addCase(
          clearServerWishlist.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to clear wishlist";
          }
        );

      // --------------------------------------------
      // Logout
      // --------------------------------------------

      builder.addCase(
        logout,
        () => initialState
      );
    },
  });

export const {
  clearWishlistFeedback,
  resetWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;