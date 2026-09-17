import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <main className="page-shell">
      <div className="page-container">
        {/* Hero */}
        <section className="rounded-[26px] bg-gradient-to-br from-[#172033] via-[#243047] to-[#3d2c1e] p-8 text-white shadow-lg md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            Administration
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            BookHaven Admin
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Manage the bookstore catalog, inventory, customer orders and review
            moderation from one central dashboard.
          </p>
        </section>

        {/* Management Tools */}
        <section className="mt-8">
          <p className="eyebrow">
            Store Management
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
            Administration tools
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Manage BookHaven's core store operations using the available
            administration modules.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <AdminCard
              icon="C"
              title="Categories"
              description="Create and organize bookstore categories used across the product catalog."
              link="/admin/categories"
              action="Manage Categories"
            />

            <AdminCard
              icon="B"
              title="Books & Inventory"
              description="Manage products, pricing, discounts, stock levels, availability and featured titles."
              link="/admin/books"
              action="Manage Books"
            />

            <AdminCard
              icon="O"
              title="Orders"
              description="Review customer purchases and manage payment information and fulfillment progress."
              link="/admin/orders"
              action="Manage Orders"
            />

            <AdminCard
              icon="R"
              title="Reviews"
              description="Moderate customer ratings, verified-purchase feedback and review visibility."
              link="/admin/reviews"
              action="Manage Reviews"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminCard({
  icon,
  title,
  description,
  link,
  action,
}) {
  return (
    <article className="store-card store-card-hover flex h-full flex-col p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 font-black text-amber-800">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-stone-900">
        {title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-stone-500">
        {description}
      </p>

      <div className="mt-6">
        <Link
          to={link}
          className="btn-primary"
        >
          {action}
        </Link>
      </div>
    </article>
  );
}

export default AdminDashboard;