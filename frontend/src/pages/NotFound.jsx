import {
  Link,
} from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-7xl font-black text-amber-600">
          404
        </p>

        <h1 className="mt-4 text-2xl font-extrabold text-stone-900">
          Page not found
        </h1>

        <p className="mt-2 text-stone-500">
          The page you requested does not exist.
        </p>

        <Link
          to="/"
          className="btn-primary mt-6"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;