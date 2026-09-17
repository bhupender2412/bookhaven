import { useEffect } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Route,
  Routes,
} from "react-router-dom";

import {
  verifySession,
} from "./features/auth/authSlice";

import {
  fetchCart,
} from "./features/cart/cartSlice";

import {
  fetchWishlist,
} from "./features/wishlist/wishlistSlice";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminBooks from "./pages/AdminBooks";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminReviews from "./pages/AdminReviews";

import NotFound from "./pages/NotFound";

import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const dispatch =
    useDispatch();

  const {
    token,
    initialized,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth,
  );

  const {
    initialized:
      cartInitialized,
  } = useSelector(
    (state) => state.cart,
  );

  const {
    initialized:
      wishlistInitialized,
  } = useSelector(
    (state) =>
      state.wishlist,
  );

  // --------------------------------------------------
  // Restore Auth Session
  // --------------------------------------------------

  useEffect(() => {
    if (
      token &&
      !initialized
    ) {
      dispatch(
        verifySession(),
      );
    }
  }, [
    token,
    initialized,
    dispatch,
  ]);

  // --------------------------------------------------
  // Restore Persistent Cart
  // --------------------------------------------------

  useEffect(() => {
    if (
      initialized &&
      isAuthenticated &&
      !cartInitialized
    ) {
      dispatch(
        fetchCart(),
      );
    }
  }, [
    initialized,
    isAuthenticated,
    cartInitialized,
    dispatch,
  ]);

  // --------------------------------------------------
  // Restore Persistent Wishlist
  // --------------------------------------------------

  useEffect(() => {
    if (
      initialized &&
      isAuthenticated &&
      !wishlistInitialized
    ) {
      dispatch(
        fetchWishlist(),
      );
    }
  }, [
    initialized,
    isAuthenticated,
    wishlistInitialized,
    dispatch,
  ]);

  // --------------------------------------------------
  // Initial App Loading
  // --------------------------------------------------

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ee]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading BookHaven...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        element={
          <MainLayout />
        }
      >
        {/* Public Routes */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/books"
          element={
            <Books />
          }
        />

        <Route
          path="/books/:slug"
          element={
            <BookDetails />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        {/* Protected User Routes */}

        <Route
          element={
            <ProtectedRoute />
          }
        >
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />

          <Route
            path="/wishlist"
            element={
              <Wishlist />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout />
            }
          />

          {/* Main Orders Route */}
          <Route
            path="/my-orders"
            element={
              <MyOrders />
            }
          />

          {/* Keep old route working too */}
          <Route
            path="/orders"
            element={
              <MyOrders />
            }
          />

          <Route
            path="/orders/:orderId/success"
            element={
              <OrderSuccess />
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <OrderDetails />
            }
          />
        </Route>

        {/* Admin Routes */}

        <Route
          element={
            <AdminRoute />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminCategories />
            }
          />

          <Route
            path="/admin/books"
            element={
              <AdminBooks />
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminOrders />
            }
          />

          <Route
            path="/admin/orders/:orderId"
            element={
              <AdminOrderDetails />
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <AdminReviews />
            }
          />
        </Route>

        {/* 404 */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;