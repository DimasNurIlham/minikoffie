import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LogOut, 
  LogIn, 
  Coffee, 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarCheck, 
  ChefHat, 
  PackageSearch,
  History,
  Store,
  Users,       // Icon baru untuk Users
  ClipboardList // Icon baru untuk Orders
} from "lucide-react";
import api from "../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path 
    ? "bg-black text-white shadow-lg shadow-black/10" 
    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* LOGO AREA */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-black p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Coffee className="text-white" size={24} />
          </div>
          <h1 className="font-black text-2xl tracking-tighter text-gray-900">
            MINI<span className="text-gray-400">KOFFIE</span>
          </h1>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1">
          
          {token && (
            <>
              {/* CUSTOMER LINKS */}
              {role === "customer" && (
                <>
                  <NavLink to="/" icon={<Store size={18} />} label="Reservasi" active={isActive("/")} />
                  <NavLink to="/my-reservations" icon={<History size={18} />} label="My Order" active={isActive("/my-reservations")} />
                </>
              )}

              {/* STAFF LINKS */}
              {role === "staff" && (
                <>
                  <NavLink to="/staff/orders" icon={<ChefHat size={18} />} label="Kitchen Area" active={isActive("/staff/orders")} />
                  <NavLink to="/staff/inventory" icon={<PackageSearch size={18} />} label="Inventory" active={isActive("/staff/inventory")} />
                </>
              )}

              {/* ADMIN LINKS */}
              {role === "admin" && (
                <>
                  <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" active={isActive("/admin")} />
                  <NavLink to="/admin/users" icon={<Users size={18} />} label="Users" active={isActive("/admin/users")} />
                  <NavLink to="/admin/menus" icon={<UtensilsCrossed size={18} />} label="Menus" active={isActive("/admin/menus")} />
                  <NavLink to="/admin/orders" icon={<ClipboardList size={18} />} label="Orders" active={isActive("/admin/orders")} />
                  <NavLink to="/admin/reservations" icon={<CalendarCheck size={18} />} label="Schedules" active={isActive("/admin/reservations")} />
                </>
              )}

              <div className="w-px h-6 bg-gray-200 mx-3" />
            </>
          )}

          {/* AUTH BUTTON */}
          {token ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-500 font-bold hover:bg-rose-50 transition-all active:scale-95"
            >
              <LogOut size={18} />
              <span className="text-sm">Keluar</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              <LogIn size={18} />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${active}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}