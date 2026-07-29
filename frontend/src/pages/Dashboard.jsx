import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { ShieldCheck, FileText, Wallet, Users } from "lucide-react";

function StatCard({ label, value, subtext, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{label}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-md ${accent}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-3">{subtext}</p>}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("/api/reports/dashboard")
        .then((response) => setStats(response.data))
        .catch(() => setError("Could not load dashboard stats."))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, {user?.name}
          </p>
        </header>

        <div className="p-8">
          {user?.role === "admin" && (
            <>
              {loading && <p className="text-slate-500 text-sm">Loading dashboard...</p>}
              {error && <p className="text-red-600 text-sm">{error}</p>}

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    label="Total Policies"
                    value={stats.policies.total}
                    subtext={`Active ${stats.policies.active} · Cancelled ${stats.policies.cancelled}`}
                    icon={ShieldCheck}
                    accent="bg-blue-600"
                  />
                  <StatCard
                    label="Total Claims"
                    value={stats.claims.total}
                    subtext={`Pending ${stats.claims.pending} · Approved ${stats.claims.approved}`}
                    icon={FileText}
                    accent="bg-amber-600"
                  />
                  <StatCard
                    label="Premium Collected"
                    value={`₹${stats.premium_collection.total_collected}`}
                    subtext={`Pending ₹${stats.premium_collection.total_pending}`}
                    icon={Wallet}
                    accent="bg-emerald-600"
                  />
                  <StatCard
                    label="Total Customers"
                    value={stats.customers.total}
                    subtext="Registered on the platform"
                    icon={Users}
                    accent="bg-slate-600"
                  />
                </div>
              )}
            </>
          )}

          {user?.role !== "admin" && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <p className="text-slate-600 text-sm">
                Your policies, claims, and payments will appear here — coming up next.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;