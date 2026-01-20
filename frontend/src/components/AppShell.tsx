import { Link, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <strong>GigIt</strong>
        <nav style={{ display: 'inline-flex', gap: 12, marginLeft: 16 }}>
          <Link to="/">My Jobs</Link>
          <Link to="/jobs/all">All Jobs</Link>
          <Link to="/jobs/create">Create Job</Link>
          <Link to="/me">Profile</Link>
        </nav>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}

