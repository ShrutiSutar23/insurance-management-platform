import { useEffect, useState } from "react";
import api from "../../api/axios";
import CustomerLayout from "../../components/CustomerLayout";
import { Plus, X, Clock, CheckCircle2, XCircle } from "lucide-react";

function ClaimBadge({ status }) {
  const config = {
    pending: { icon: Clock, style: "bg-amber-50 text-amber-700" },
    approved: { icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700" },
    rejected: { icon: XCircle, style: "bg-red-50 text-red-700" },
  };
  const { icon: Icon, style } = config[status] || config.pending;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}><Icon size={13} />{status}</span>;
}

function SubmitClaimModal({ policies, onClose, onCreated }) {
  const [form, setForm] = useState({ policy_id: "", claim_amount: "", reason: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const activePolicies = policies.filter((p) => p.status === "active");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await api.post("/api/my/claims", { ...form, claim_amount: parseFloat(form.claim_amount) });
      onCreated(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit claim.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Submit a Claim</h3>
        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <select required value={form.policy_id} onChange={(e) => setForm({ ...form, policy_id: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="">-- Select your policy --</option>
            {activePolicies.map((p) => <option key={p.id} value={p.id}>{p.policy_number} — {p.policy_type}</option>)}
          </select>
          <input required type="number" min="1" step="0.01" placeholder="Claim Amount (₹)" value={form.claim_amount}
            onChange={(e) => setForm({ ...form, claim_amount: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <textarea required rows={3} placeholder="Reason for claim..." value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Submitting..." : "Submit Claim"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchClaims = () => api.get("/api/my/claims").then((res) => setClaims(res.data)).finally(() => setLoading(false));

  useEffect(() => {
    fetchClaims();
    api.get("/api/my/policies").then((res) => setPolicies(res.data));
  }, []);

  return (
    <CustomerLayout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800">My Claims</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          <Plus size={16} /> Submit Claim
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading...</p>}
      {!loading && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Reason</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Submitted</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-400">No claims submitted yet.</td></tr>}
              {claims.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{c.reason}</td>
                  <td className="px-5 py-3 text-slate-700">₹{c.claim_amount}</td>
                  <td className="px-5 py-3 text-slate-500">{c.submission_date?.slice(0, 10)}</td>
                  <td className="px-5 py-3"><ClaimBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <SubmitClaimModal policies={policies} onClose={() => setShowModal(false)} onCreated={fetchClaims} />}
    </CustomerLayout>
  );
}

export default MyClaims;