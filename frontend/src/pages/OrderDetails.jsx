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
  clearCurrentOrder,
  fetchOrderById,
} from "../features/orders/orderSlice";

function OrderDetails() {
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
    dispatch(
      fetchOrderById(
        orderId
      )
    );

    return () => {
      dispatch(
        clearCurrentOrder()
      );
    };
  }, [
    orderId,
    dispatch,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading order details...
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
                "This order could not be found."}
            </p>

            <Link
              to="/orders"
              className="btn-primary mt-6"
            >
              Back to My Orders
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
    ).toLocaleString(
      "en-IN",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
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
    <main className="page-shell">
      <div className="page-container">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link
            to="/orders"
            className="hover:text-amber-700"
          >
            My Orders
          </Link>

          <span>/</span>

          <span className="font-semibold text-stone-800">
            {
              order.orderNumber
            }
          </span>
        </div>

        {/* Header */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Order Details
          </p>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {
                  order.orderNumber
                }
              </h1>

              <p className="mt-3 text-sm text-slate-300">
                Placed on{" "}
                {placedDate}
              </p>
            </div>

            <OrderStatus
              status={
                order.orderStatus
              }
            />
          </div>
        </section>

        {/* Status Timeline */}
        <section className="store-card mt-8 p-6 md:p-8">
          <p className="eyebrow">
            Order Progress
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
            Delivery status
          </h2>

          <OrderTimeline
            status={
              order.orderStatus
            }
          />
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* Left */}
          <div className="space-y-8">

            {/* Items */}
            <section className="store-card overflow-hidden">
              <div className="border-b border-stone-200 px-6 py-5">
                <p className="eyebrow">
                  Purchased Books
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                  Order items
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  {totalQuantity}{" "}
                  {totalQuantity === 1
                    ? "item"
                    : "items"}{" "}
                  in this order.
                </p>
              </div>

              <div className="divide-y divide-stone-100">
                {order.items.map(
                  (item) => (
                    <OrderItem
                      key={`${order._id}-${item.book}`}
                      item={
                        item
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* Delivery */}
            <section className="store-card p-6 md:p-8">
              <p className="eyebrow">
                Delivery
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Shipping address
              </h2>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
                <p className="font-extrabold text-stone-900">
                  {
                    order
                      .shippingAddress
                      .fullName
                  }
                </p>

                <p className="mt-2">
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

                <p className="mt-3 font-semibold text-stone-700">
                  Phone:{" "}
                  {
                    order
                      .shippingAddress
                      .phone
                  }
                </p>
              </div>
            </section>
          </div>

          {/* Right */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-[96px]">

            {/* Payment */}
            <section className="store-card p-6">
              <p className="eyebrow">
                Payment
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-stone-900">
                Payment details
              </h2>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Method"
                  value={
                    order.paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : order.paymentMethod
                  }
                />

                <InfoRow
                  label="Payment status"
                  value={
                    order.paymentStatus
                  }
                  capitalize
                />

                <InfoRow
                  label="Order status"
                  value={
                    order.orderStatus
                  }
                  capitalize
                />
              </div>
            </section>

            {/* Summary */}
            <section className="store-card p-6">
              <p className="eyebrow">
                Summary
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-stone-900">
                Payment summary
              </h2>

              <div className="mt-6 space-y-4 border-b border-stone-200 pb-5">
                <InfoRow
                  label="Items"
                  value={`₹${order.itemsPrice}`}
                />

                <InfoRow
                  label="Shipping"
                  value={
                    order.shippingPrice ===
                    0
                      ? "FREE"
                      : `₹${order.shippingPrice}`
                  }
                />
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">
                    Total paid / payable
                  </p>

                  <p className="mt-1 text-xs text-stone-400">
                    {
                      order.paymentMethod ===
                      "cod"
                        ? "Pay on delivery"
                        : "Order total"
                    }
                  </p>
                </div>

                <p className="text-3xl font-black text-stone-900">
                  ₹
                  {
                    order.totalPrice
                  }
                </p>
              </div>
            </section>

            <Link
              to="/orders"
              className="btn-secondary flex w-full items-center justify-center"
            >
              ← Back to My Orders
            </Link>

            <Link
              to="/books"
              className="btn-primary flex w-full items-center justify-center"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function OrderItem({
  item,
}) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">

        <Link
          to={`/books/${item.slug}`}
          className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100"
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
            <div className="flex h-full w-full items-center justify-center border-l-4 border-amber-700 bg-stone-800 px-2 text-center text-[10px] font-bold text-white">
              {
                item.title
              }
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/books/${item.slug}`}
            className="text-lg font-extrabold text-stone-900 transition hover:text-amber-700"
          >
            {item.title}
          </Link>

          <p className="mt-1 text-sm text-stone-500">
            by {item.author}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MiniDetail
              label="Quantity"
              value={
                item.quantity
              }
            />

            <MiniDetail
              label="Purchase Price"
              value={`₹${item.unitPrice}`}
            />

            <MiniDetail
              label="Item Total"
              value={`₹${item.subtotal}`}
            />
          </div>

          <p className="mt-4 text-xs text-stone-400">
            Purchase price is locked
            to this order even if the
            current book price changes.
          </p>
        </div>
      </div>
    </article>
  );
}

function MiniDetail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-stone-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
        {label}
      </p>

      <p className="mt-1 font-extrabold text-stone-800">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  capitalize = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-stone-500">
        {label}
      </span>

      <span
        className={`text-right font-bold text-stone-800 ${
          capitalize
            ? "capitalize"
            : ""
        }`}
      >
        {value}
      </span>
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
      className={`w-fit rounded-full px-4 py-2 text-sm font-extrabold capitalize ${
        styles[status] ||
        "bg-white/10 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function OrderTimeline({
  status,
}) {
  if (
    status ===
    "cancelled"
  ) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-extrabold text-red-700">
          Order Cancelled
        </p>

        <p className="mt-1 text-sm text-red-600">
          This order will not continue
          through the delivery process.
        </p>
      </div>
    );
  }

  const stages = [
    "placed",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex =
    stages.indexOf(
      status
    );

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-5">
      {stages.map(
        (
          stage,
          index
        ) => {
          const completed =
            index <=
            currentIndex;

          return (
            <div
              key={
                stage
              }
            >
              <div
                className={`h-2 rounded-full ${
                  completed
                    ? "bg-amber-600"
                    : "bg-stone-200"
                }`}
              />

              <p
                className={`mt-2 text-xs font-bold capitalize ${
                  completed
                    ? "text-amber-700"
                    : "text-stone-400"
                }`}
              >
                {stage}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}

export default OrderDetails;