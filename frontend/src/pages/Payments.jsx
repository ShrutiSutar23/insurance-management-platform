import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

function PaymentStatusBadge({ status }) {
  const config = {
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    overdue: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config[status] || config.pending}`}>
      {status}
    </span>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Payments() {
  const [overduePayments, setOverduePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/payments/overdue")
      .then((response) => setOverduePayments(response.data))
      .catch(() => setError("Could not load payment data."))
      .finally(() => setLoading(false));
  }, []);

  const totalOverdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Premium Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track overdue and pending premiums
          </p>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
              <div className="p-3 rounded-md bg-red-600">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Overdue Payments</p>
                <p className="text-2xl font-semibold text-slate-800">{overduePayments.length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
              <div className="p-3 rounded-md bg-slate-700">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Amount Overdue</p>
                <p className="text-2xl font-semibold text-slate-800">₹{formatCurrency(totalOverdueAmount)}</p>
              </div>
            </div>
          </div>

          {loading && <p className="text-slate-500 text-sm">Loading payments...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-medium text-slate-700">Overdue Premiums</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Policy ID</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Due Date</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overduePayments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <div className="flex flex-col items-center text-slate-400">
                          <CheckCircle2 size={28} className="mb-2 text-emerald-400" />
                          <p className="text-sm">No overdue payments — all caught up</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {overduePayments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-5 py-3 text-slate-800 font-medium">#{p.policy_id}</td>
                      <td className="px-5 py-3 text-slate-700 font-medium">₹{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(p.due_date)}</td>
                      <td className="px-5 py-3"><PaymentStatusBadge status={p.payment_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Payments;