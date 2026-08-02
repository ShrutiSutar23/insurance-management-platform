import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { LayoutDashboard, Users, FileText, ShieldCheck, Wallet, FolderOpen, LogOut, UserCheck, Inbox }
from "lucide-react";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Approvals", path: "/approvals", icon: UserCheck },
    { label: "Customers", path: "/customers", icon: Users },
    { label: "Policies", path: "/policies", icon: ShieldCheck },
    { label: "Claims", path: "/claims", icon: FileText },
    { label: "Payments", path: "/payments", icon: Wallet },
    { label: "Documents", path: "/documents", icon: FolderOpen },
    { label: "Policy Requests", path: "/policy-requests", icon: Inbox },
    { label: "Plans", path: "/plans", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6 border-b border-slate-800">
            <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h1 className="text-white font-semibold text-lg leading-tight">InsureManage</h1>
                    <p className="text-slate-400 text-xs mt-1">Management Platform</p>
                </div>
                <NotificationBell />
            </div>
        <h1 className="text-white font-semibold text-lg leading-tight">
          InsureManage
        </h1>
        <p className="text-slate-400 text-xs mt-1">Management Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm text-white font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;