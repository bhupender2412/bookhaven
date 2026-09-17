import { useState } from "react";

import {
  Link,
  Navigate,
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

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    loading,
    error,
  } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      dispatch(
        clearAuthError()
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      dispatch(
        authFailed(
          "Passwords do not match"
        )
      );

      return;
    }

    dispatch(
      loginStart()
    );

    try {
      const response =
        await api.post(
          "/auth/register",
          {
            name:
              formData.name,

            email:
              formData.email,

            phone:
              formData.phone,

            password:
              formData.password,
          }
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
        "/",
        {
          replace: true,
        }
      );
    } catch (error) {
      const apiMessage =
        error.response?.data?.message;

      const validationMessage =
        error.response?.data?.errors?.[0]
          ?.message;

      dispatch(
        authFailed(
          validationMessage ||
            apiMessage ||
            "Registration failed"
        )
      );
    }
  };

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <main className="page-shell px-6 py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_35px_rgba(41,37,36,0.08)] lg:grid-cols-[1fr_460px]">

        <section className="hidden bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
              Join BookHaven
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight">
              Build your personal reading shelf.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-slate-300">
              Create an account to save books,
              manage your cart, place orders,
              and keep track of every purchase.
            </p>
          </div>

          <div className="space-y-3">
            <Benefit text="Save books to your wishlist" />
            <Benefit text="Track your orders" />
            <Benefit text="Manage your account and addresses" />
          </div>
        </section>

        <section className="p-7 sm:p-10">
          <div>
            <p className="eyebrow">
              Create Account
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
              Start your BookHaven journey
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              Create your account to unlock
              wishlist, checkout, orders and
              profile features.
            </p>
          </div>

          {error && (
            <div className="alert-error mt-6">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="form-label">
                Full name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                autoComplete="name"
                placeholder="Your full name"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Email address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Phone number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Optional"
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
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Confirm password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <div className="mt-7 border-t border-stone-200 pt-6 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-amber-700 hover:text-amber-900"
              >
                Sign in
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

export default Register;