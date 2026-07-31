import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import policyInfo from "../data/policyInfo";
import { ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (!user) navigate("/login");
    else navigate(user.role === "customer" ? "/my/dashboard" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={22} />
          <span className="font-semibold text-slate-800">InsureManage</span>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> {user ? "Back to Dashboard" : "Back to Login"}
        </button>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-700 to-blue-600 text-white px-6 md:px-10 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Insurance plans built around your life</h1>
        <p className="text-blue-100 max-w-xl mx-auto text-sm md:text-base">
          Compare coverage, benefits, and starting premiums across our core plans —
          and choose what fits you best.
        </p>
      </section>

      {/* Plan cards */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(policyInfo).map(([type, info]) => (
            <div key={type} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${info.color}`}>
                  <info.icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">{type}</h3>
                  <p className="text-sm text-slate-500">{info.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{info.description}</p>

              <ul className="space-y-2 mb-5">
                {info.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" /> {b}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Starting premium</p>
                  <p className="text-lg font-semibold text-slate-800">₹{info.startingPremium}/yr</p>
                </div>
                {user?.role === "customer" && (
                  <button
                    onClick={() => navigate("/my/policies")}
                    className="bg-slate-800 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-900 transition"
                  >
                    Request This Plan
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-slate-800 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-900 transition"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Plans;