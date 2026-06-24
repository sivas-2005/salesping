import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Users, LogOut, Zap } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leads", label: "Leads", icon: Users },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Zap size={22} className="brand-icon" />
        <span>SalesPing</span>
      </div>

      <div className="navbar-links">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${location.pathname === to ? "active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <span className="user-name">{user?.name}</span>
        <button onClick={handleLogout} className="btn-icon" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
