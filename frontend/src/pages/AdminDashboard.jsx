import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            BookHaven Admin
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Manage your catalog, inventory, customer orders, users and store
            operations from one place.
          </p>
        </section>

        <section className="mt-8">
          <p className="eyebrow">Store Management</p>

          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
            Administration tools
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Categories"
              description="Create, edit and organize the categories used throughout the bookstore."
              link="/admin/categories"
              action="Manage Categories"
            />

            <AdminCard
              title="Books"
              description="Manage bookstore products, pricing, discounts, stock and featured titles."
              link="/admin/books"
              action="Manage Books"
            />

            <AdminCard
              title="Orders"
              description="Order processing and shipping management will be added later."
              disabled
            />

            <AdminCard
              title="Customers"
              description="Customer administration will be available later."
              disabled
            />

            <AdminCard
              title="Inventory"
              description="Monitor stock levels and low-stock products."
              disabled
            />

            <AdminCard
              title="Analytics"
              description="Revenue, sales and bookstore analytics will appear here."
              disabled
            />

            <AdminCard
              title="Orders"
              description="Review customer purchases, payment status and fulfillment progress."
              link="/admin/orders"
              action="Manage Orders"
            />

            <AdminCard
              title="Reviews"
              description="Moderate customer ratings, verified feedback and review visibility."
              link="/admin/reviews"
              action="Manage Reviews"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminCard({ title, description, link, action, disabled = false }) {
  return (
    <article className="store-card store-card-hover p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 font-black text-amber-800">
        {title.charAt(0)}
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-stone-900">{title}</h3>

      <p className="mt-2 min-h-16 text-sm leading-6 text-stone-500">
        {description}
      </p>

      {disabled ? (
        <span className="mt-6 inline-flex rounded-lg bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-400">
          Coming Soon
        </span>
      ) : (
        <Link to={link} className="btn-primary mt-6">
          {action}
        </Link>
      )}
    </article>
  );
}

export default AdminDashboard;
