import {
  Link,
} from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-[#172033] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">

        <div className="md:col-span-2">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 font-black text-white">
              B
            </div>

            <span className="text-xl font-extrabold">
              BookHaven
            </span>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Discover books worth reading,
            collect stories worth keeping,
            and shop from anywhere.
          </p>
        </div>

        <div>
          <h3 className="font-bold">
            Explore
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link
              to="/books"
              className="block hover:text-amber-300"
            >
              Browse Books
            </Link>

            <Link
              to="/wishlist"
              className="block hover:text-amber-300"
            >
              Wishlist
            </Link>

            <Link
              to="/cart"
              className="block hover:text-amber-300"
            >
              Cart
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold">
            Account
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <Link
              to="/login"
              className="block hover:text-amber-300"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="block hover:text-amber-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} BookHaven.
        Built as a full-stack MERN e-commerce project.
      </div>
    </footer>
  );
}

export default Footer;