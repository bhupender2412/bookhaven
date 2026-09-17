import {
  configureStore,
} from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/orders/orderSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";

export const store =
  configureStore({
    reducer: {
      auth: authReducer,

      cart: cartReducer,

      orders: orderReducer,

      wishlist:
        wishlistReducer,
    },
  });