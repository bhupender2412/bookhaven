import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api/api";

function AdminOrderDetails() {
  const {
    orderId,
  } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const fetchOrder =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/orders/admin/${orderId}`
          );

        setOrder(
          response.data.order
        );
      } catch (error) {
        setOrder(null);

        setError(
          error.response?.data
            ?.message ||
            "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus =
    async (
      nextStatus
    ) => {
      if (!order) {
        return;
      }

      if (
        nextStatus ===
        "cancelled"
      ) {
        const confirmed =
          window.confirm(
            `Cancel order "${order.orderNumber}"? Inventory will be restored.`
          );

        if (!confirmed) {
          return;
        }
      }

      try {
        setActionLoading(true);
        setError("");
        setMessage("");

        const response =
          await api.patch(
            `/orders/admin/${order._id}/status`,
            {
              orderStatus:
                nextStatus,
            }
          );

        setMessage(
          response.data
            .message ||
            "Order updated successfully"
        );

        // Refetch so customer population,
        // payment status and dates remain accurate.
        await fetchOrder();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to update order"
        );
      } finally {
        setActionLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

          <p className="mt-4 text-sm font-semibold text-stone-500">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !order
  ) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <section className="empty-state">
            <h1 className="text-2xl font-extrabold text-stone-900">
              Order unavailable
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              {error}
            </p>

            <Link
              to="/admin/orders"
              className="btn-primary mt-6"
            >
              Back to Orders
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

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

  const nextAction =
    getNextAction(
      order.orderStatus
    );

  const canCancel =
    ![
      "delivered",
      "cancelled",
    ].includes(
      order.orderStatus
    );

  return (
    <main className="page-shell">
      <div className="page-container">

        {/* Back */}
        <Link
          to="/admin/orders"
          className="text-sm font-bold text-amber-700 hover:text-amber-900"
        >
          ← Back to Orders
        </Link>

        {/* Header */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">

          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Order Administration
          </p>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {order.orderNumber}
              </h1>

              <p className="mt-3 text-sm text-slate-300">
                Placed{" "}
                {placedDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <OrderStatus
                status={
                  order.orderStatus
                }
              />

              <PaymentStatus
                status={
                  order.paymentStatus
                }
              />
            </div>
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        {message && (
          <div className="alert-success mt-6">
            {message}
          </div>
        )}

        {/* Fulfillment Controls */}
        <section className="store-card mt-8 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="eyebrow">
                Fulfillment
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Manage order status
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                Move the order through
                the allowed fulfillment
                stages. Status rules are
                also enforced by the
                backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              {nextAction && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(
                      nextAction.status
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="btn-primary"
                >
                  {actionLoading
                    ? "Updating..."
                    : nextAction.label}
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(
                      "cancelled"
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  className="rounded-xl bg-red-50 px-5 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <OrderTimeline
            status={
              order.orderStatus
            }
          />
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_370px]">

          {/* LEFT */}
          <div className="space-y-8">

            {/* Items */}
            <section className="store-card overflow-hidden">
              <div className="border-b border-stone-200 px-6 py-5">

                <p className="eyebrow">
                  Products
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                  Order items
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  {totalQuantity}{" "}
                  {totalQuantity === 1
                    ? "item"
                    : "items"}{" "}
                  purchased.
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

            {/* Customer */}
            <section className="store-card p-6 md:p-8">
              <p className="eyebrow">
                Customer
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Customer information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoBox
                  label="Name"
                  value={
                    order.user
                      ?.name ||
                    "—"
                  }
                />

                <InfoBox
                  label="Email"
                  value={
                    order.user
                      ?.email ||
                    "—"
                  }
                />

                <InfoBox
                  label="Phone"
                  value={
                    order.user
                      ?.phone ||
                    order
                      .shippingAddress
                      ?.phone ||
                    "—"
                  }
                />

                <InfoBox
                  label="User Role"
                  value={
                    order.user
                      ?.role ||
                    "user"
                  }
                />
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

          {/* RIGHT */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-[96px]">

            {/* Payment */}
            <section className="store-card p-6">
              <p className="eyebrow">
                Payment
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-stone-900">
                Payment information
              </h2>

              <div className="mt-5 space-y-4">

                <SummaryRow
                  label="Method"
                  value={
                    order.paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : order.paymentMethod
                  }
                />

                <SummaryRow
                  label="Payment status"
                  value={
                    order.paymentStatus
                  }
                  capitalize
                />

                <SummaryRow
                  label="Order status"
                  value={
                    order.orderStatus
                  }
                  capitalize
                />

                {order.deliveredAt && (
                  <SummaryRow
                    label="Delivered"
                    value={
                      new Date(
                        order.deliveredAt
                      ).toLocaleString(
                        "en-IN"
                      )
                    }
                  />
                )}
              </div>
            </section>

            {/* Totals */}
            <section className="store-card p-6">
              <p className="eyebrow">
                Order Value
              </p>

              <h2 className="mt-2 text-xl font-extrabold text-stone-900">
                Payment summary
              </h2>

              <div className="mt-6 space-y-4 border-b border-stone-200 pb-5">

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
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">

                <p className="font-extrabold text-stone-900">
                  Total
                </p>

                <p className="text-3xl font-black text-stone-900">
                  ₹
                  {
                    order.totalPrice
                  }
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function getNextAction(
  status
) {
  const actions = {
    placed: {
      status:
        "confirmed",

      label:
        "Confirm Order",
    },

    confirmed: {
      status:
        "processing",

      label:
        "Start Processing",
    },

    processing: {
      status:
        "shipped",

      label:
        "Mark as Shipped",
    },

    shipped: {
      status:
        "delivered",

      label:
        "Mark as Delivered",
    },
  };

  return (
    actions[status] ||
    null
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

            <ItemMetric
              label="Quantity"
              value={
                item.quantity
              }
            />

            <ItemMetric
              label="Unit Price"
              value={`₹${item.unitPrice}`}
            />

            <ItemMetric
              label="Subtotal"
              value={`₹${item.subtotal}`}
            />
          </div>

          <p className="mt-4 text-xs text-stone-400">
            These prices are the
            purchase-price snapshot
            stored with the order.
          </p>
        </div>
      </div>
    </article>
  );
}

function ItemMetric({
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

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">

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

function PaymentStatus({
  status,
}) {
  const styles = {
    paid:
      "bg-emerald-100 text-emerald-700",

    pending:
      "bg-amber-100 text-amber-800",

    failed:
      "bg-red-100 text-red-700",

    refunded:
      "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-extrabold capitalize ${
        styles[status] ||
        "bg-white/10 text-white"
      }`}
    >
      Payment: {status}
    </span>
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
      className={`rounded-full px-4 py-2 text-sm font-extrabold capitalize ${
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
      <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">

        <p className="font-extrabold text-red-700">
          Order Cancelled
        </p>

        <p className="mt-1 text-sm leading-6 text-red-600">
          Inventory from this order
          has been restored by the
          backend.
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
    <div className="mt-8 grid gap-3 sm:grid-cols-5">

      {stages.map(
        (
          stage,
          index
        ) => {
          const completed =
            index <=
            currentIndex;

          const current =
            index ===
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
                  current
                    ? "text-amber-700"
                    : completed
                      ? "text-stone-700"
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

export default AdminOrderDetails;