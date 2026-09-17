import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/api";

import {
  logout,
} from "../auth/authSlice";

const emptyCart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
};

// --------------------------------------------------
// Fetch Cart
// --------------------------------------------------

export const fetchCart =
  createAsyncThunk(
    "cart/fetchCart",
    async (_, thunkAPI) => {
      try {
        const response =
          await api.get("/cart");

        return response.data.cart;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to load cart"
        );
      }
    }
  );

// --------------------------------------------------
// Add Item
// --------------------------------------------------

export const addToCart =
  createAsyncThunk(
    "cart/addToCart",
    async (
      {
        bookId,
        quantity = 1,
      },
      thunkAPI
    ) => {
      try {
        const response =
          await api.post(
            "/cart/items",
            {
              bookId,
              quantity,
            }
          );

        return {
          cart:
            response.data.cart,

          message:
            response.data.message,
        };
      } catch (error) {
        const validationMessage =
          error.response?.data
            ?.errors?.[0]
            ?.message;

        return thunkAPI.rejectWithValue(
          validationMessage ||
            error.response?.data
              ?.message ||
            "Failed to add book to cart"
        );
      }
    }
  );

// --------------------------------------------------
// Update Quantity
// --------------------------------------------------

export const updateCartQuantity =
  createAsyncThunk(
    "cart/updateQuantity",
    async (
      {
        bookId,
        quantity,
      },
      thunkAPI
    ) => {
      try {
        const response =
          await api.patch(
            `/cart/items/${bookId}`,
            {
              quantity,
            }
          );

        return response.data.cart;
      } catch (error) {
        const validationMessage =
          error.response?.data
            ?.errors?.[0]
            ?.message;

        return thunkAPI.rejectWithValue(
          validationMessage ||
            error.response?.data
              ?.message ||
            "Failed to update cart"
        );
      }
    }
  );

// --------------------------------------------------
// Remove Item
// --------------------------------------------------

export const removeFromCart =
  createAsyncThunk(
    "cart/removeFromCart",
    async (
      bookId,
      thunkAPI
    ) => {
      try {
        const response =
          await api.delete(
            `/cart/items/${bookId}`
          );

        return response.data.cart;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to remove book"
        );
      }
    }
  );

// --------------------------------------------------
// Clear Cart
// --------------------------------------------------

export const clearServerCart =
  createAsyncThunk(
    "cart/clearCart",
    async (_, thunkAPI) => {
      try {
        const response =
          await api.delete("/cart");

        return response.data.cart;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data
            ?.message ||
            "Failed to clear cart"
        );
      }
    }
  );

const cartSlice =
  createSlice({
    name: "cart",

    initialState: {
      ...emptyCart,

      loading: false,
      actionLoading: false,
      initialized: false,

      error: "",
      message: "",
    },

    reducers: {
      resetCart: (state) => {
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;

        state.loading = false;
        state.actionLoading = false;
        state.initialized = false;

        state.error = "";
        state.message = "";
      },

      clearCartFeedback: (
        state
      ) => {
        state.error = "";
        state.message = "";
      },
    },

    extraReducers: (
      builder
    ) => {
      // --------------------------------------------
      // Fetch Cart
      // --------------------------------------------

      builder
        .addCase(
          fetchCart.pending,
          (state) => {
            state.loading = true;
            state.error = "";
          }
        )

        .addCase(
          fetchCart.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.initialized = true;

            state.items =
              action.payload.items ||
              [];

            state.totalItems =
              action.payload
                .totalItems || 0;

            state.subtotal =
              action.payload
                .subtotal || 0;

            state.error = "";
          }
        )

        .addCase(
          fetchCart.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;
            state.initialized = true;

            state.error =
              action.payload ||
              "Failed to load cart";
          }
        );

      // --------------------------------------------
      // Add Item
      // --------------------------------------------

      builder
        .addCase(
          addToCart.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          addToCart.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            const cart =
              action.payload.cart;

            state.items =
              cart.items || [];

            state.totalItems =
              cart.totalItems || 0;

            state.subtotal =
              cart.subtotal || 0;

            state.message =
              action.payload
                .message ||
              "Book added to cart";

            state.error = "";
          }
        )

        .addCase(
          addToCart.rejected,
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
      // Update Quantity
      // --------------------------------------------

      builder
        .addCase(
          updateCartQuantity.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          updateCartQuantity.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.items =
              action.payload.items ||
              [];

            state.totalItems =
              action.payload
                .totalItems || 0;

            state.subtotal =
              action.payload
                .subtotal || 0;

            state.message =
              "Cart updated successfully";

            state.error = "";
          }
        )

        .addCase(
          updateCartQuantity.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to update cart";
          }
        );

      // --------------------------------------------
      // Remove Item
      // --------------------------------------------

      builder
        .addCase(
          removeFromCart.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          removeFromCart.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.items =
              action.payload.items ||
              [];

            state.totalItems =
              action.payload
                .totalItems || 0;

            state.subtotal =
              action.payload
                .subtotal || 0;

            state.message =
              "Book removed from cart";

            state.error = "";
          }
        )

        .addCase(
          removeFromCart.rejected,
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
      // Clear Cart
      // --------------------------------------------

      builder
        .addCase(
          clearServerCart.pending,
          (state) => {
            state.actionLoading =
              true;

            state.error = "";
            state.message = "";
          }
        )

        .addCase(
          clearServerCart.fulfilled,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.items =
              action.payload.items ||
              [];

            state.totalItems =
              action.payload
                .totalItems || 0;

            state.subtotal =
              action.payload
                .subtotal || 0;

            state.message =
              "Cart cleared successfully";

            state.error = "";
          }
        )

        .addCase(
          clearServerCart.rejected,
          (
            state,
            action
          ) => {
            state.actionLoading =
              false;

            state.error =
              action.payload ||
              "Failed to clear cart";
          }
        );

      // --------------------------------------------
      // Authentication Logout
      // --------------------------------------------

      builder.addCase(
        logout,
        (state) => {
          state.items = [];
          state.totalItems = 0;
          state.subtotal = 0;

          state.loading = false;
          state.actionLoading = false;
          state.initialized = false;

          state.error = "";
          state.message = "";
        }
      );
    },
  });

export const {
  resetCart,
  clearCartFeedback,
} = cartSlice.actions;

export default cartSlice.reducer;