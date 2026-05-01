import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'inherit' }}>TaskMaster</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            <span className="text-muted" style={{ margin: '0 10px' }}>|</span>
            <span className="badge badge-todo">{user.role}</span>
            <span style={{ fontWeight: 500 }}>{user.name}</span>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
