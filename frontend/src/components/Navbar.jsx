import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  logout,
} from "../features/auth/authSlice";

function Navbar() {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  const {
    totalItems,
  } = useSelector(
    (state) => state.cart
  );

  const {
    count: wishlistCount,
  } = useSelector(
    (state) => state.wishlist
  );

  const handleLogout = () => {
    dispatch(
      logout()
    );

    navigate(
      "/",
      {
        replace: true,
      }
    );
  };

  const navClass = ({
    isActive,
  }) => {
    return isActive
      ? "rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700"
      : "rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-amber-700";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-xl font-black text-white">
            B
          </div>

          <div>
            <p className="text-xl font-extrabold tracking-tight text-stone-900">
              BookHaven
            </p>

            <p className="-mt-1 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400 sm:block">
              Books worth keeping
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">

          {/* Home */}
          <NavLink
            to="/"
            className={navClass}
          >
            Home
          </NavLink>

          {/* Books */}
          <NavLink
            to="/books"
            className={navClass}
          >
            Books
          </NavLink>

          {/* Wishlist */}
          {isAuthenticated && (
            <NavLink
              to="/wishlist"
              className={navClass}
            >
              <span className="flex items-center gap-2">
                Wishlist

                {wishlistCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-[10px] font-extrabold text-white">
                    {wishlistCount > 99
                      ? "99+"
                      : wishlistCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}

          {/* Cart */}
          <NavLink
            to="/cart"
            className={navClass}
          >
            <span className="flex items-center gap-2">
              Cart

              {isAuthenticated &&
                totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-[10px] font-extrabold text-white">
                    {totalItems > 99
                      ? "99+"
                      : totalItems}
                  </span>
                )}
            </span>
          </NavLink>

          {/* My Orders */}
          {isAuthenticated && (
            <NavLink
              to="/my-orders"
              className={navClass}
            >
              My Orders
            </NavLink>
          )}

          {/* Admin */}
          {user?.role ===
            "admin" && (
            <NavLink
              to="/admin"
              className={navClass}
            >
              Admin
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              {/* User Profile */}
              <Link
                to="/profile"
                className="ml-3 hidden items-center gap-3 border-l border-stone-200 pl-4 md:flex"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="max-w-36">
                  <p className="truncate text-sm font-bold text-stone-800 transition hover:text-amber-700">
                    {user?.name}
                  </p>

                  <p className="text-[11px] capitalize text-stone-400">
                    {user?.role}
                  </p>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={
                  handleLogout
                }
                className="ml-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <NavLink
                to="/login"
                className={
                  navClass
                }
              >
                Sign In
              </NavLink>

              {/* Register */}
              <Link
                to="/register"
                className="ml-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 px-4 py-2.5 text-sm font-bold text-white transition hover:from-amber-600 hover:to-amber-800"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;