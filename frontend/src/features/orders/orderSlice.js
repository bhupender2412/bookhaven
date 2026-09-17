import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import api from "../../api/api";

import {
    logout,
} from "../auth/authSlice";

const initialState = {
    orders: [],
    currentOrder: null,

    loading: false,
    placingOrder: false,

    initialized: false,

    error: "",
    message: "",
};

// --------------------------------------------------
// Place Order
// --------------------------------------------------

export const placeOrder =
    createAsyncThunk(
        "orders/placeOrder",
        async (
            orderData,
            thunkAPI
        ) => {
            try {
                const response =
                    await api.post(
                        "/orders",
                        orderData
                    );

                return {
                    order:
                        response.data.order,

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
                    "Failed to place order"
                );
            }
        }
    );

// --------------------------------------------------
// Get My Orders
// --------------------------------------------------

export const fetchMyOrders =
    createAsyncThunk(
        "orders/fetchMyOrders",
        async (_, thunkAPI) => {
            try {
                const response =
                    await api.get(
                        "/orders/my"
                    );

                return (
                    response.data.orders ||
                    []
                );
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response?.data
                        ?.message ||
                    "Failed to load orders"
                );
            }
        }
    );

// --------------------------------------------------
// Get My Order By ID
// --------------------------------------------------

export const fetchOrderById =
    createAsyncThunk(
        "orders/fetchOrderById",
        async (
            orderId,
            thunkAPI
        ) => {
            try {
                const response =
                    await api.get(
                        `/orders/my/${orderId}`
                    );

                return response.data.order;
            } catch (error) {
                return thunkAPI.rejectWithValue(
                    error.response?.data
                        ?.message ||
                    "Failed to load order"
                );
            }
        }
    );

const orderSlice =
    createSlice({
        name: "orders",

        initialState,

        reducers: {
            clearOrderFeedback: (
                state
            ) => {
                state.error = "";
                state.message = "";
            },

            clearCurrentOrder: (
                state
            ) => {
                state.currentOrder =
                    null;
            },

            resetOrders: () =>
                initialState,
        },

        extraReducers: (
            builder
        ) => {
            // --------------------------------------------
            // Place Order
            // --------------------------------------------

            builder
                .addCase(
                    placeOrder.pending,
                    (state) => {
                        state.placingOrder =
                            true;

                        state.error = "";
                        state.message = "";
                    }
                )

                .addCase(
                    placeOrder.fulfilled,
                    (
                        state,
                        action
                    ) => {
                        state.placingOrder =
                            false;

                        state.currentOrder =
                            action.payload.order;

                        state.orders.unshift(
                            action.payload.order
                        );

                        state.message =
                            action.payload
                                .message ||
                            "Order placed successfully";

                        state.error = "";
                    }
                )

                .addCase(
                    placeOrder.rejected,
                    (
                        state,
                        action
                    ) => {
                        state.placingOrder =
                            false;

                        state.error =
                            action.payload ||
                            "Failed to place order";
                    }
                );

            // --------------------------------------------
            // My Orders
            // --------------------------------------------

            builder
                .addCase(
                    fetchMyOrders.pending,
                    (state) => {
                        state.loading = true;
                        state.error = "";
                    }
                )

                .addCase(
                    fetchMyOrders.fulfilled,
                    (
                        state,
                        action
                    ) => {
                        state.loading = false;
                        state.initialized = true;

                        state.orders =
                            action.payload;

                        state.error = "";
                    }
                )

                .addCase(
                    fetchMyOrders.rejected,
                    (
                        state,
                        action
                    ) => {
                        state.loading = false;
                        state.initialized = true;

                        state.error =
                            action.payload ||
                            "Failed to load orders";
                    }
                );

            // --------------------------------------------
            // Order Details
            // --------------------------------------------

            builder
                .addCase(
                    fetchOrderById.pending,
                    (state) => {
                        state.loading = true;
                        state.error = "";

                        state.currentOrder =
                            null;
                    }
                )

                .addCase(
                    fetchOrderById.fulfilled,
                    (
                        state,
                        action
                    ) => {
                        state.loading = false;

                        state.currentOrder =
                            action.payload;

                        state.error = "";
                    }
                )

                .addCase(
                    fetchOrderById.rejected,
                    (
                        state,
                        action
                    ) => {
                        state.loading = false;

                        state.currentOrder =
                            null;

                        state.error =
                            action.payload ||
                            "Failed to load order";
                    }
                );
            builder.addCase(
                logout,
                () => initialState
            );
        },
    });

export const {
    clearOrderFeedback,
    clearCurrentOrder,
    resetOrders,
} = orderSlice.actions;

export default orderSlice.reducer;