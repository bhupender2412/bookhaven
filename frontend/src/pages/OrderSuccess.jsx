import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchOrderById,
} from "../features/orders/orderSlice";

function OrderSuccess() {
  const {
    orderId,
  } = useParams();

  const dispatch =
    useDispatch();

  const {
    currentOrder,
    loading,
    error,
  } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    if (
      !currentOrder ||
      currentOrder._id !==
        orderId
    ) {
      dispatch(
        fetchOrderById(
          orderId
        )
      );
    }
  }, [
    currentOrder,
    orderId,
    dispatch,
  ]);

  if (
    loading &&
    !currentOrder
  ) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !currentOrder
  ) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <section className="empty-state">
            <h1 className="text-2xl font-extrabold text-stone-900">
              Order unavailable
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              {error ||
                "We could not load this order."}
            </p>

            <Link
              to="/"
              className="btn-primary mt-6"
            >
              Return Home
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const order =
    currentOrder;

  const placedDate =
    new Date(
      order.placedAt ||
        order.createdAt
    ).toLocaleString();

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Success */}
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
            ✓
          </div>

          <p className="eyebrow mt-6">
            Order Confirmed
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-stone-900">
            Thank you for your order.
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-stone-500">
            Your order has been placed
            successfully. Keep your
            order number for reference.
          </p>

          <div className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-3 font-mono text-sm font-bold text-white">
            {order.orderNumber}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-4xl store-card overflow-hidden">

          <div className="grid gap-6 border-b border-stone-200 p-6 md:grid-cols-3">
            <OrderMeta
              label="Status"
              value={
                order.orderStatus
              }
            />

            <OrderMeta
              label="Payment"
              value="Cash on Delivery"
            />

            <OrderMeta
              label="Placed"
              value={
                placedDate
              }
            />
          </div>

          {/* Items */}
          <div className="p-6">
            <p className="eyebrow">
              Order Items
            </p>

            <div className="mt-5 divide-y divide-stone-100">
              {order.items.map(
                (item) => (
                  <div
                    key={
                      item.book
                    }
                    className="flex items-center justify-between gap-5 py-4"
                  >
                    <div>
                      <Link
                        to={`/books/${item.slug}`}
                        className="font-extrabold text-stone-900 transition hover:text-amber-700"
                      >
                        {
                          item.title
                        }
                      </Link>

                      <p className="mt-1 text-sm text-stone-500">
                        {
                          item.author
                        }
                      </p>

                      <p className="mt-1 text-xs text-stone-400">
                        Qty{" "}
                        {
                          item.quantity
                        }{" "}
                        × ₹
                        {
                          item.unitPrice
                        }
                      </p>
                    </div>

                    <p className="font-extrabold text-stone-900">
                      ₹
                      {
                        item.subtotal
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Address + Totals */}
          <div className="grid border-t border-stone-200 md:grid-cols-2">

            <div className="p-6">
              <p className="eyebrow">
                Delivery Address
              </p>

              <div className="mt-4 text-sm leading-7 text-stone-600">
                <p className="font-bold text-stone-800">
                  {
                    order
                      .shippingAddress
                      .fullName
                  }
                </p>

                <p>
                  {
                    order
                      .shippingAddress
                      .addressLine1
                  }
                </p>

                {order
                  .shippingAddress
                  .addressLine2 && (
                  <p>
                    {
                      order
                        .shippingAddress
                        .addressLine2
                    }
                  </p>
                )}

                <p>
                  {
                    order
                      .shippingAddress
                      .city
                  }
                  ,{" "}
                  {
                    order
                      .shippingAddress
                      .state
                  }{" "}
                  {
                    order
                      .shippingAddress
                      .postalCode
                  }
                </p>

                <p>
                  {
                    order
                      .shippingAddress
                      .country
                  }
                </p>

                <p className="mt-2">
                  Phone:{" "}
                  {
                    order
                      .shippingAddress
                      .phone
                  }
                </p>
              </div>
            </div>

            <div className="border-t border-stone-200 p-6 md:border-l md:border-t-0">
              <p className="eyebrow">
                Payment Summary
              </p>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  label="Items"
                  value={`₹${order.itemsPrice}`}
                />

                <SummaryRow
                  label="Shipping"
                  value={
                    order.shippingPrice ===
                    0
                      ? "FREE"
                      : `₹${order.shippingPrice}`
                  }
                />

                <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                  <span className="font-extrabold text-stone-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-stone-900">
                    ₹
                    {
                      order.totalPrice
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/books"
            className="btn-primary"
          >
            Continue Shopping
          </Link>

          <Link
            to="/profile"
            className="btn-secondary"
          >
            My Account
          </Link>
        </div>
      </div>
    </main>
  );
}

function OrderMeta({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-2 break-words font-bold capitalize text-stone-800">
        {value}
      </p>
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

export default OrderSuccess;