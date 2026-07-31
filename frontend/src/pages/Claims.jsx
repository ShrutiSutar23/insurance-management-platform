import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Clock, CheckCircle2, XCircle, FileText, Plus, X } from "lucide-react";

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

function SubmitClaimModal({ policies, onClose, onCreated }) {
  const [form, setForm] = useState({ policy_id: "", claim_amount: "", reason: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const activePolicies = policies.filter((p) => p.status === "active");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/api/claims", {
        ...form,
        claim_amount: parseFloat(form.claim_amount),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit claim.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Submit a Claim</h3>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Policy (active only)</label>
            <select
              value={form.policy_id}
              onChange={(e) => setForm({ ...form, policy_id: e.target.value })}
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select policy --</option>
              {activePolicies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.policy_number} — {p.customer_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Claim Amount (₹)</label>
            <input
              type="number"
              value={form.claim_amount}
              onChange={(e) => setForm({ ...form, claim_amount: e.target.value })}
              required
              min="1"
              step="0.01"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              rows={3}
              placeholder="Describe the reason for this claim..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 transition disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Claims() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const fetchClaims = (status = "") => {
    setLoading(true);
    api
      .get(`/api/claims?status=${status}`)
      .then((response) => setClaims(response.data.data))
      .catch(() => setError("Could not load claims."))
      .finally(() => setLoading(false));
  };

  const fetchPolicies = () => {
    api.get("/api/policies").then((response) => setPolicies(response.data.data));
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, []);

  const handleReview = (claimId, status) => {
    setActionMsg("");
    api
      .put(`/api/claims/${claimId}/review`, { status })
      .then(() => {
        setActionMsg(`Claim ${status}.`);
        fetchClaims(statusFilter);
      })
      .catch((err) => setActionMsg(err.response?.data?.error || "Could not update claim."));
  };

  const counts = {
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Claims</h2>
            <p className="text-sm text-slate-500 mt-0.5">Review and track insurance claims</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Submit Claim
          </button>
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

          {actionMsg && <p className="text-sm text-slate-600 mb-3">{actionMsg}</p>}
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
                    <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
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
                      <td className="px-5 py-3">
                        {c.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(c.id, "approved")}
                              className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(c.id, "rejected")}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <SubmitClaimModal
            policies={policies}
            onClose={() => setShowModal(false)}
            onCreated={() => fetchClaims(statusFilter)}
          />
        )}
      </main>
    </div>
  );
}

export default Claims;