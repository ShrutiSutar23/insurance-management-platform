import { useEffect, useState } from "react";
import api from "../../api/axios";
import CustomerLayout from "../../components/CustomerLayout";
import { useAuth } from "../../context/AuthContext";
import { getPolicyInfo } from "../../data/policyInfo";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

function MyDashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/my/policies").then((res) => setPolicies(res.data)).finally(() => setLoading(false));
  }, []);

  const activePolicies = policies.filter((p) => p.status === "active");

  return (
    <CustomerLayout>
      <h2 className="text-2xl font-semibold text-slate-800 mb-1">Welcome, {user?.name}</h2>
      <p className="text-slate-500 text-sm mb-6">Here's an overview of your insurance coverage</p>

      {loading && <p className="text-slate-500 text-sm">Loading...</p>}

      {!loading && activePolicies.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400">
          You don't have any active policies yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activePolicies.map((p) => {
          const info = getPolicyInfo(p.policy_type);
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600 rounded-md">
                  <info.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{p.policy_type}</h3>
                  <p className="text-xs text-slate-400">{p.policy_number}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{info.description}</p>
              <ul className="space-y-1.5">
                {info.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span>Premium: ₹{p.premium_amount}</span>
                <span>Valid till {p.end_date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </CustomerLayout>
  );
}

export default MyDashboard;