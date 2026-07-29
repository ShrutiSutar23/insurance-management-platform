import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

function ClaimStatusBadge({ status }) {
  const config = {
    pending: { icon: Clock, style: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
    approved: { icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    rejected: { icon: XCircle, style: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  };
  const { icon: Icon, style } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}

function SummaryPill({ label, value, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-5 py-4 flex-1">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

function Claims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchClaims = (status = "") => {
    setLoading(true);
    api
      .get(`/api/claims?status=${status}`)
      .then((response) => setClaims(response.data.data))
      .catch(() => setError("Could not load claims."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const counts = {
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Claims</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and track insurance claims
          </p>
        </header>

        <div className="p-8">
          <div className="flex gap-4 mb-6">
            <SummaryPill label="Pending" value={counts.pending} accent="text-amber-600" />
            <SummaryPill label="Approved" value={counts.approved} accent="text-emerald-600" />
            <SummaryPill label="Rejected" value={counts.rejected} accent="text-red-600" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchClaims(e.target.value);
              }}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading && <p className="text-slate-500 text-sm">Loading claims...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Policy No.</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Reason</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Submitted</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center text-slate-400">
                          <FileText size={28} className="mb-2" />
                          <p className="text-sm">No claims found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {claims.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-5 py-3 text-slate-800 font-medium">{c.policy_number}</td>
                      <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{c.reason}</td>
                      <td className="px-5 py-3 text-slate-700 font-medium">₹{formatCurrency(c.claim_amount)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(c.submission_date)}</td>
                      <td className="px-5 py-3"><ClaimStatusBadge status={c.status} /></td>
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

export default Claims;