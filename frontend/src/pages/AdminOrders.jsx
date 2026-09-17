import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api from "../api/api";

function AdminOrders() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [orders, setOrders] =
    useState([]);

  const [stats, setStats] =
    useState({
      totalOrders: 0,
      placed: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
    });

  const [pageInfo, setPageInfo] =
    useState({
      page: 1,
      pages: 1,
      total: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState(
    searchParams.get("search") ||
      ""
  );

  const status =
    searchParams.get("status") ||
    "all";

  const search =
    searchParams.get("search") ||
    "";

  const page =
    Number(
      searchParams.get("page")
    ) || 1;

  const fetchStats =
    useCallback(async () => {
      try {
        const response =
          await api.get(
            "/orders/admin/stats"
          );

        setStats(
          response.data.stats
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to load order statistics"
        );
      }
    }, []);

  const fetchOrders =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 10,
        };

        if (
          status &&
          status !== "all"
        ) {
          params.status =
            status;
        }

        if (search) {
          params.search =
            search;
        }

        const response =
          await api.get(
            "/orders/admin/all",
            {
              params,
            }
          );

        setOrders(
          response.data.orders ||
            []
        );

        setPageInfo({
          page:
            response.data.page ||
            1,

          pages:
            response.data.pages ||
            1,

          total:
            response.data.total ||
            0,
        });
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
    ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateFilter = (
    key,
    value
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    if (
      value &&
      value !== "all"
    ) {
      params.set(
        key,
        value
      );
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.set(
        "page",
        "1"
      );
    }

    setSearchParams(params);
  };

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    updateFilter(
      "search",
      searchInput.trim()
    );
  };

  const clearFilters = () => {
    setSearchInput("");

    setSearchParams({});
  };

  return (
    <main className="page-shell">
      <div className="page-container">

        <Link
          to="/admin"
          className="text-sm font-bold text-amber-700 hover:text-amber-900"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* Hero */}
        <section className="mt-6 rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Fulfillment Administration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Order Management
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Review customer orders,
            monitor fulfillment,
            payment status and delivery
            progress.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Total Orders"
              value={
                stats.totalOrders
              }
            />

            <Metric
              label="Placed"
              value={
                stats.placed
              }
            />

            <Metric
              label="In Progress"
              value={
                stats.confirmed +
                stats.processing +
                stats.shipped
              }
            />

            <Metric
              label="Delivered"
              value={
                stats.delivered
              }
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Cancelled"
              value={
                stats.cancelled
              }
            />

            <Metric
              label="Confirmed"
              value={
                stats.confirmed
              }
            />

            <Metric
              label="Shipped"
              value={
                stats.shipped
              }
            />

            <Metric
              label="Order Value"
              value={`₹${stats.revenue}`}
            />
          </div>
        </section>

        {error && (
          <div className="alert-error mt-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <section className="store-card mt-8 p-5">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 lg:grid-cols-[1fr_240px_auto_auto] lg:items-end"
          >
            <div>
              <label className="form-label">
                Search order
              </label>

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Search BH- order number..."
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Order status
              </label>

              <select
                value={status}
                onChange={(
                  event
                ) =>
                  updateFilter(
                    "status",
                    event.target
                      .value
                  )
                }
                className="form-input"
              >
                <option value="all">
                  All Orders
                </option>

                <option value="placed">
                  Placed
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary h-[48px]"
            >
              Search
            </button>

            {(search ||
              status !==
                "all") && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="btn-secondary h-[48px]"
              >
                Clear
              </button>
            )}
          </form>
        </section>

        {/* Orders */}
        <section className="store-card mt-8 overflow-hidden">
          <div className="border-b border-stone-200 px-6 py-5">
            <p className="eyebrow">
              Orders
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
              Customer Orders
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {pageInfo.total}{" "}
              {pageInfo.total === 1
                ? "order"
                : "orders"}{" "}
              found.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />

              <p className="mt-4 text-sm font-semibold text-stone-500">
                Loading orders...
              </p>
            </div>
          ) : orders.length ===
            0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                📦
              </div>

              <p className="mt-4 font-extrabold text-stone-800">
                No orders found
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Try changing your
                search or status
                filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-6 py-4">
                      Order
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Items
                    </th>

                    <th className="px-6 py-4">
                      Total
                    </th>

                    <th className="px-6 py-4">
                      Payment
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {orders.map(
                    (order) => (
                      <OrderRow
                        key={
                          order._id
                        }
                        order={
                          order
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {pageInfo.pages >
          1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={
                pageInfo.page <=
                1
              }
              onClick={() =>
                updateFilter(
                  "page",
                  String(
                    pageInfo.page -
                      1
                  )
                )
              }
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm font-bold text-stone-600">
              Page{" "}
              {pageInfo.page} of{" "}
              {pageInfo.pages}
            </span>

            <button
              type="button"
              disabled={
                pageInfo.page >=
                pageInfo.pages
              }
              onClick={() =>
                updateFilter(
                  "page",
                  String(
                    pageInfo.page +
                      1
                  )
                )
              }
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function OrderRow({
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

  const totalItems =
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
    <tr className="transition hover:bg-stone-50/70">

      <td className="px-6 py-5">
        <p className="whitespace-nowrap font-extrabold text-stone-900">
          {order.orderNumber}
        </p>

        <p className="mt-1 text-xs text-stone-400">
          {date}
        </p>
      </td>

      <td className="px-6 py-5">
        <div className="min-w-[180px]">
          <p className="font-bold text-stone-800">
            {order.user?.name ||
              "Customer"}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {order.user?.email ||
              "—"}
          </p>

          {order.user?.phone && (
            <p className="mt-1 text-xs text-stone-400">
              {order.user.phone}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="font-bold text-stone-700">
          {totalItems}
        </span>
      </td>

      <td className="px-6 py-5">
        <p className="font-extrabold text-stone-900">
          ₹{order.totalPrice}
        </p>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="text-xs font-bold text-stone-700">
            {order.paymentMethod ===
            "cod"
              ? "COD"
              : order.paymentMethod}
          </p>

          <PaymentStatus
            status={
              order.paymentStatus
            }
          />
        </div>
      </td>

      <td className="px-6 py-5">
        <OrderStatus
          status={
            order.orderStatus
          }
        />
      </td>

      <td className="px-6 py-5">
        <Link
          to={`/admin/orders/${order._id}`}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

function PaymentStatus({
  status,
}) {
  return (
    <span
      className={`mt-1 inline-block text-[11px] font-bold capitalize ${
        status === "paid"
          ? "text-emerald-700"
          : status ===
              "failed"
            ? "text-red-600"
            : "text-amber-700"
      }`}
    >
      {status}
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
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ${
        styles[status] ||
        "bg-stone-100 text-stone-600"
      }`}
    >
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default AdminOrders;