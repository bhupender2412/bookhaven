import {
  useSelector,
} from "react-redux";

function Profile() {
  const {
    user,
  } = useSelector(
    (state) => state.auth
  );

  const joinedDate =
    user?.createdAt
      ? new Date(
          user.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "—";

  return (
    <main className="page-shell">
      <div className="page-container">

        <div>
          <p className="eyebrow">
            My Account
          </p>

          <h1 className="page-title">
            Profile
          </h1>

          <p className="page-subtitle">
            View your BookHaven account
            information and manage your
            personal details.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">

          {/* Profile summary */}
          <section className="store-card h-fit p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 text-3xl font-black text-white">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-stone-900">
              {user?.name}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {user?.email}
            </p>

            <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold capitalize text-amber-800">
              {user?.role}
            </span>

            <div className="mt-6 border-t border-stone-200 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Member Since
              </p>

              <p className="mt-2 font-semibold text-stone-700">
                {joinedDate}
              </p>
            </div>
          </section>

          {/* Account details */}
          <section className="store-card p-6 md:p-8">
            <div>
              <p className="eyebrow">
                Personal Information
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-stone-900">
                Account details
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Profile editing and address
                management will be added in
                the account-management phase.
              </p>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <ProfileField
                label="Full Name"
                value={user?.name}
              />

              <ProfileField
                label="Email Address"
                value={user?.email}
              />

              <ProfileField
                label="Phone Number"
                value={
                  user?.phone ||
                  "Not provided"
                }
              />

              <ProfileField
                label="Account Role"
                value={user?.role}
                capitalize
              />
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-bold text-amber-900">
                Account features coming next
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Later this page will support
                profile editing, password
                changes, shipping addresses,
                order history and account
                settings.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileField({
  label,
  value,
  capitalize = false,
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p
        className={`mt-2 font-semibold text-stone-800 ${
          capitalize
            ? "capitalize"
            : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default Profile;