import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import policyInfo from "../data/policyInfo";
import { ShieldCheck, CheckCircle2, Users2, FileCheck2 } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
      navigate(user.role === "customer" ? "/my/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero band */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-28 relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-white text-lg">InsureManage</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white max-w-lg leading-tight">
            Insurance that moves as fast as your life does.
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-md">
            Manage policies, track claims, and pay premiums — all from one place.
          </p>

          <div className="flex gap-8 mt-8">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Users2 size={16} className="text-sky-400" /> 1,000+ customers protected
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <FileCheck2 size={16} className="text-sky-400" /> Claims settled digitally
            </div>
          </div>
        </div>
      </div>

      {/* Floating login card */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative">
        <div className="bg-white shadow-xl shadow-slate-900/10 border border-slate-100 rounded-2xl p-8 w-full max-w-md mx-auto">
          <h2 className="font-display text-xl font-semibold text-slate-800 mb-1">Sign in to your account</h2>
          <p className="text-sm text-slate-500 mb-6">Access your policies, claims, and payments</p>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Policy showcase */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-16">
        <div className="text-center mb-10">
          <h3 className="font-display text-2xl font-semibold text-slate-800">Coverage for every part of your life</h3>
          <p className="text-sm text-slate-500 mt-1">Explore our core insurance plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(policyInfo).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <div
                key={type}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`p-3 rounded-xl ${info.color} w-fit mb-4`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="font-display font-semibold text-slate-800 mb-1">{type}</h4>
                <p className="text-xs text-slate-500 mb-4">{info.tagline}</p>
                <ul className="space-y-1.5 mb-4">
                  {info.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                  From <span className="text-slate-700 font-semibold">₹{info.startingPremium}</span>/yr
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/plans" className="text-blue-600 text-sm font-medium hover:underline">
            View full plan details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;