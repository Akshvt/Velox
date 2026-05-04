import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="center min-h-screen flex-col gap-4">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-[rgb(var(--color-muted))]">Page not found.</p>
      <Link to="/" className="underline">
        Go home
      </Link>
    </main>
  );
}
