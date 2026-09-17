import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  resetCart,
} from "../features/cart/cartSlice";

import {
  clearOrderFeedback,
  placeOrder,
} from "../features/orders/orderSlice";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function Checkout() {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    user,
  } = useSelector(
    (state) => state.auth
  );

  const {
    items,
    totalItems,
    subtotal,
    loading: cartLoading,
    initialized: cartInitialized,
  } = useSelector(
    (state) => state.cart
  );

  const {
    placingOrder,
    error,
  } = useSelector(
    (state) => state.orders
  );

  const [
    formData,
    setFormData,
  ] = useState({
    ...emptyAddress,

    fullName:
      user?.name || "",

    phone:
      user?.phone || "",
  });

  useEffect(() => {
    dispatch(
      clearOrderFeedback()
    );

    return () => {
      dispatch(
        clearOrderFeedback()
      );
    };
  }, [dispatch]);

  const shippingPrice =
    subtotal >= 999
      ? 0
      : 79;

  const totalPrice =
    subtotal +
    shippingPrice;

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
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        const result =
          await dispatch(
            placeOrder({
              shippingAddress:
                formData,

              paymentMethod:
                "cod",
            })
          ).unwrap();

        dispatch(
          resetCart()
        );

        navigate(
          `/orders/${result.order._id}/success`,
          {
            replace: true,
          }
        );
      } catch {
        // Redux already stores
        // the backend error.
      }
    };

  if (
    cartLoading &&
    !cartInitialized
  ) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Preparing checkout...
          </p>
        </div>
      </div>
    );
  }

  if (
    cartInitialized &&
    items.length === 0
  ) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <section className="empty-state">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              🛒
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-stone-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Add some books before
              continuing to checkout.
            </p>

            <Link
              to="/books"
              className="btn-primary mt-6"
            >
              Browse Books
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">

        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link
            to="/cart"
            className="hover:text-amber-700"
          >
            Cart
          </Link>

          <span>/</span>

          <span className="font-semibold text-stone-800">
            Checkout
          </span>
        </div>

        <div className="mt-6">
          <p className="eyebrow">
            Secure Checkout
          </p>

          <h1 className="page-title">
            Complete your order
          </h1>

          <p className="page-subtitle">
            Enter your delivery details
            and review your books before
            placing the order.
          </p>
        </div>

        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">

          {/* Address */}
          <form
            id="checkout-form"
            onSubmit={
              handleSubmit
            }
            className="store-card p-6 md:p-8"
          >
            <p className="eyebrow">
              Delivery
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              Shipping address
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Enter the address where
              your books should be
              delivered.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              <CheckoutField
                label="Full name"
                name="fullName"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="Your full name"
                required
              />

              <CheckoutField
                label="Phone number"
                name="phone"
                type="tel"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="9876543210"
                required
              />

              <div className="sm:col-span-2">
                <CheckoutField
                  label="Address line 1"
                  name="addressLine1"
                  value={
                    formData.addressLine1
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="House number, street, locality"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <CheckoutField
                  label="Address line 2"
                  name="addressLine2"
                  value={
                    formData.addressLine2
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Apartment, landmark, etc. (optional)"
                />
              </div>

              <CheckoutField
                label="City"
                name="city"
                value={
                  formData.city
                }
                onChange={
                  handleChange
                }
                placeholder="City"
                required
              />

              <CheckoutField
                label="State"
                name="state"
                value={
                  formData.state
                }
                onChange={
                  handleChange
                }
                placeholder="State"
                required
              />

              <CheckoutField
                label="Postal code"
                name="postalCode"
                value={
                  formData.postalCode
                }
                onChange={
                  handleChange
                }
                placeholder="Postal code"
                required
              />

              <CheckoutField
                label="Country"
                name="country"
                value={
                  formData.country
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 font-black text-amber-800">
                  ₹
                </div>

                <div>
                  <p className="font-extrabold text-stone-900">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Payment will be
                    collected when the
                    order is delivered.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-[96px]">
            <div className="store-card overflow-hidden">

              <div className="border-b border-stone-200 px-6 py-5">
                <p className="eyebrow">
                  Review
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                  Order summary
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <div className="max-h-[350px] divide-y divide-stone-100 overflow-y-auto">
                {items.map(
                  (item) => (
                    <CheckoutItem
                      key={
                        item.book._id
                      }
                      item={
                        item
                      }
                    />
                  )
                )}
              </div>

              <div className="border-t border-stone-200 p-6">
                <div className="space-y-4">
                  <SummaryRow
                    label="Items"
                    value={
                      totalItems
                    }
                  />

                  <SummaryRow
                    label="Subtotal"
                    value={`₹${subtotal}`}
                  />

                  <SummaryRow
                    label="Shipping"
                    value={
                      shippingPrice === 0
                        ? "FREE"
                        : `₹${shippingPrice}`
                    }
                  />
                </div>

                {shippingPrice ===
                  0 && (
                  <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    Free shipping applied
                  </div>
                )}

                {shippingPrice >
                  0 && (
                  <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Add ₹
                    {999 -
                      subtotal}{" "}
                    more for free shipping.
                  </div>
                )}

                <div className="mt-5 flex items-end justify-between border-t border-stone-200 pt-5">
                  <div>
                    <p className="text-sm text-stone-500">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-stone-400">
                      Cash on Delivery
                    </p>
                  </div>

                  <p className="text-3xl font-black text-stone-900">
                    ₹{totalPrice}
                  </p>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={
                    placingOrder
                  }
                  className="btn-primary mt-6 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder
                    ? "Placing Order..."
                    : `Place Order • ₹${totalPrice}`}
                </button>

                <Link
                  to="/cart"
                  className="mt-3 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
                >
                  ← Back to Cart
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-stone-400">
                  Final prices and stock
                  are verified again by
                  the server before the
                  order is created.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CheckoutField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label className="form-label">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
}

function CheckoutItem({
  item,
}) {
  return (
    <div className="flex gap-4 p-5">
      <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100">
        {item.book.coverImage ? (
          <img
            src={
              item.book
                .coverImage
            }
            alt={
              item.book.title
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border-l-4 border-amber-700 bg-stone-800 px-1 text-center text-[9px] font-bold text-white">
            {
              item.book
                .title
            }
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-stone-900">
          {item.book.title}
        </p>

        <p className="mt-1 text-xs text-stone-500">
          Qty {item.quantity}
        </p>

        <p className="mt-2 text-sm font-bold text-stone-800">
          ₹{item.subtotal}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-stone-500">
        {label}
      </span>

      <span className="font-bold text-stone-800">
        {value}
      </span>
    </div>
  );
}

export default Checkout;