import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
} from "react-router-dom";

import {
  clearOrderFeedback,
  fetchMyOrders,
} from "../features/orders/orderSlice";

function MyOrders() {
  const dispatch =
    useDispatch();

  const {
    orders,
    loading,
    initialized,
    error,
  } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    dispatch(
      clearOrderFeedback()
    );

    if (!initialized) {
      dispatch(
        fetchMyOrders()
      );
    }
  }, [
    dispatch,
    initialized,
  ]);

  if (
    loading &&
    !initialized
  ) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">

        <div>
          <p className="eyebrow">
            Purchase History
          </p>

          <h1 className="page-title">
            My Orders
          </h1>

          <p className="page-subtitle">
            Track your BookHaven orders
            and review previous purchases.
          </p>
        </div>

        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <section className="empty-state mt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-stone-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              When you purchase books,
              your order history will
              appear here.
            </p>

            <Link
              to="/books"
              className="btn-primary mt-6"
            >
              Browse Books
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map(
              (order) => (
                <OrderCard
                  key={
                    order._id
                  }
                  order={
                    order
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({
  order,
}) {
  const date =
    new Date(
      order.placedAt ||
        order.createdAt
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const totalQuantity =
    order.items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  return (
    <article className="store-card overflow-hidden">

      <div className="flex flex-col gap-5 border-b border-stone-200 bg-stone-50/70 px-6 py-5 md:flex-row md:items-center md:justify-between">

        <div className="flex flex-wrap gap-x-8 gap-y-4">

          <OrderInfo
            label="Order"
            value={
              order.orderNumber
            }
          />

          <OrderInfo
            label="Placed"
            value={date}
          />

          <OrderInfo
            label="Items"
            value={
              totalQuantity
            }
          />

          <OrderInfo
            label="Total"
            value={`₹${order.totalPrice}`}
          />
        </div>

        <OrderStatus
          status={
            order.orderStatus
          }
        />
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {order.items
            .slice(0, 3)
            .map(
              (item) => (
                <OrderItem
                  key={`${order._id}-${item.book}`}
                  item={
                    item
                  }
                />
              )
            )}

          {order.items.length >
            3 && (
            <p className="text-sm font-semibold text-stone-500">
              +
              {order.items.length -
                3}{" "}
              more item
              {order.items.length -
                3 ===
              1
                ? ""
                : "s"}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
              Payment
            </p>

            <p className="mt-1 text-sm font-bold capitalize text-stone-700">
              {order.paymentMethod ===
              "cod"
                ? "Cash on Delivery"
                : order.paymentMethod}
            </p>
          </div>

          <Link
            to={`/orders/${order._id}`}
            className="btn-secondary"
          >
            View Order Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function OrderItem({
  item,
}) {
  return (
    <div className="flex items-center gap-4">

      <Link
        to={`/books/${item.slug}`}
        className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100"
      >
        {item.coverImage ? (
          <img
            src={
              item.coverImage
            }
            alt={
              item.title
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border-l-4 border-amber-700 bg-stone-800 px-1 text-center text-[9px] font-bold text-white">
            {
              item.title
            }
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/books/${item.slug}`}
          className="font-extrabold text-stone-900 transition hover:text-amber-700"
        >
          {item.title}
        </Link>

        <p className="mt-1 text-sm text-stone-500">
          {item.author}
        </p>

        <p className="mt-1 text-xs text-stone-400">
          Qty{" "}
          {item.quantity}
          {" "}× ₹
          {item.unitPrice}
        </p>
      </div>

      <p className="shrink-0 font-extrabold text-stone-900">
        ₹{item.subtotal}
      </p>
    </div>
  );
}

function OrderInfo({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-stone-800">
        {value}
      </p>
    </div>
  );
}

function OrderStatus({
  status,
}) {
  const styles = {
    placed:
      "bg-blue-100 text-blue-700",

    confirmed:
      "bg-indigo-100 text-indigo-700",

    processing:
      "bg-amber-100 text-amber-800",

    shipped:
      "bg-purple-100 text-purple-700",

    delivered:
      "bg-emerald-100 text-emerald-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ${
        styles[status] ||
        "bg-stone-100 text-stone-600"
      }`}
    >
      {status}
    </span>
  );
}

export default MyOrders;