import { Suspense } from "react";

export default function Layout() {
  return (
    <div>
      <h3>Nested Layout</h3>
      <nav>
        <NavLink to="/nested">Index</NavLink>
        <span>|</span>
        <NavLink to="/nested/page">Page</NavLink>
      </nav>
      <Suspense fallback={<span>Loading Nested Pages...</span>}>
        <Outlet />
      </Suspense>
    </div>
  );
}
