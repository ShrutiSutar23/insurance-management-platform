import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { ShieldCheck, FileText, Wallet, FolderOpen, LogOut, Home } from "lucide-react";

function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Home", path: "/my/dashboard", icon: Home },
    { label: "My Policies", path: "/my/policies", icon: ShieldCheck },
    { label: "My Claims", path: "/my/claims", icon: FileText },
    { label: "My Payments", path: "/my/payments", icon: Wallet },
    { label: "My Documents", path: "/my/documents", icon: FolderOpen },
    { label: "Plans", path: "/plans", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-slate-800">InsureManage</h1>
          <p className="text-xs text-slate-400">Customer Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-slate-600">{user?.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 px-8 flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition ${
                isActive ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </nav>

      <main className="max-w-5xl mx-auto p-8">{children}</main>
    </div>
  );
}

export default CustomerLayout;