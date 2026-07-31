import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { Bell, ShieldCheck, FileText, Wallet, Inbox } from "lucide-react";

const iconMap = {
  policy_request: Inbox,
  policy_created: ShieldCheck,
  payment_confirmed: Wallet,
  claim_submitted: FileText,
  claim_reviewed: FileText,
};

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    api.get("/api/notifications").then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      api.put("/api/notifications/mark-read").then(() => setUnreadCount(0));
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative p-2 rounded-md hover:bg-slate-100 transition">
        <Bell size={18} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-50 top-16 ml-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700">Notifications</h4>
          </div>
          {notifications.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No notifications yet</p>
          )}
          {notifications.map((n) => {
            const Icon = iconMap[n.notif_type] || Bell;
            return (
              <div key={n.id} className={`px-4 py-3 border-b border-slate-50 flex gap-3 ${!n.is_read ? "bg-blue-50/50" : ""}`}>
                <div className="p-1.5 bg-slate-100 rounded-md h-fit">
                  <Icon size={14} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-700">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;