import { useState } from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import api from "../api/api";

import {
  authFailed,
  clearAuthError,
  loginStart,
  loginSuccess,
} from "../features/auth/authSlice";

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const dispatch =
    useDispatch();

  const {
    isAuthenticated,
    loading,
    error,
  } = useSelector(
    (state) => state.auth
  );

  const redirectPath =
    location.state?.from?.pathname ||
    "/";

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    if (error) {
      dispatch(
        clearAuthError()
      );
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    dispatch(
      loginStart()
    );

    try {
      const response =
        await api.post(
          "/auth/login",
          formData
        );

      dispatch(
        loginSuccess({
          token:
            response.data.token,

          user:
            response.data.user,
        })
      );

      navigate(
        redirectPath,
        {
          replace: true,
        }
      );
    } catch (error) {
      dispatch(
        authFailed(
          error.response?.data
            ?.message ||
            "Login failed"
        )
      );
    }
  };

  if (isAuthenticated) {
    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  return (
    <main className="page-shell px-6 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_35px_rgba(41,37,36,0.08)] lg:grid-cols-[1fr_460px]">

        {/* Brand side */}
        <section className="hidden bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
              Welcome Back
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight">
              Continue your reading journey.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-slate-300">
              Sign in to access your
              wishlist, cart, orders and
              personal account.
            </p>
          </div>

          <div className="space-y-3">
            <Benefit text="Continue shopping from your cart" />

            <Benefit text="Track current and previous orders" />

            <Benefit text="Manage wishlist and profile" />
          </div>
        </section>

        {/* Login form */}
        <section className="p-7 sm:p-10">
          <div>
            <p className="eyebrow">
              Account Access
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
              Sign in to BookHaven
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Enter your account details
              to continue.
            </p>
          </div>

          {error && (
            <div className="alert-error mt-6">
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-5"
          >
            <div>
              <label className="form-label">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <div className="mt-7 border-t border-stone-200 pt-6 text-center">
            <p className="text-sm text-stone-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-amber-700 hover:text-amber-900"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Benefit({
  text, 
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-bold text-amber-300">
        ✓
      </div>

      <span className="text-sm font-medium text-slate-300">
        {text}
      </span>
    </div>
  );
}

export default Login;