import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/api";

const savedToken =
  localStorage.getItem(
    "bookstore_token"
  );

const getSavedUser = () => {
  try {
    const value =
      localStorage.getItem(
        "bookstore_user"
      );

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    localStorage.removeItem(
      "bookstore_user"
    );

    return null;
  }
};

export const verifySession =
  createAsyncThunk(
    "auth/verifySession",

    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await api.get(
            "/auth/me"
          );

        return response.data.user;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            "Session verification failed"
        );
      }
    }
  );

const initialState = {
  token:
    savedToken || null,

  user:
    getSavedUser(),

  isAuthenticated:
    Boolean(savedToken),

  loading: false,

  initialized:
    !savedToken,

  error: null,
};

const authSlice =
  createSlice({
    name: "auth",

    initialState,

    reducers: {
      loginStart: (
        state
      ) => {
        state.loading = true;
        state.error = null;
      },

      loginSuccess: (
        state,
        action
      ) => {
        const {
          token,
          user,
        } = action.payload;

        state.token =
          token;

        state.user =
          user;

        state.isAuthenticated =
          true;

        state.loading =
          false;

        state.initialized =
          true;

        state.error =
          null;

        localStorage.setItem(
          "bookstore_token",
          token
        );

        localStorage.setItem(
          "bookstore_user",
          JSON.stringify(
            user
          )
        );
      },

      authFailed: (
        state,
        action
      ) => {
        state.loading =
          false;

        state.error =
          action.payload ||
          "Authentication failed";
      },

      updateUser: (
        state,
        action
      ) => {
        state.user =
          action.payload;

        localStorage.setItem(
          "bookstore_user",
          JSON.stringify(
            action.payload
          )
        );
      },

      clearAuthError: (
        state
      ) => {
        state.error =
          null;
      },

      logout: (
        state
      ) => {
        state.token =
          null;

        state.user =
          null;

        state.isAuthenticated =
          false;

        state.loading =
          false;

        state.initialized =
          true;

        state.error =
          null;

        localStorage.removeItem(
          "bookstore_token"
        );

        localStorage.removeItem(
          "bookstore_user"
        );
      },
    },

    extraReducers:
      (builder) => {
        builder

          .addCase(
            verifySession.pending,
            (state) => {
              state.loading =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            verifySession.fulfilled,
            (
              state,
              action
            ) => {
              state.user =
                action.payload;

              state.isAuthenticated =
                true;

              state.loading =
                false;

              state.initialized =
                true;

              state.error =
                null;

              localStorage.setItem(
                "bookstore_user",
                JSON.stringify(
                  action.payload
                )
              );
            }
          )

          .addCase(
            verifySession.rejected,
            (
              state,
              action
            ) => {
              state.token =
                null;

              state.user =
                null;

              state.isAuthenticated =
                false;

              state.loading =
                false;

              state.initialized =
                true;

              state.error =
                action.payload;

              localStorage.removeItem(
                "bookstore_token"
              );

              localStorage.removeItem(
                "bookstore_user"
              );
            }
          );
      },
  });

export const {
  loginStart,
  loginSuccess,
  authFailed,
  updateUser,
  clearAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;