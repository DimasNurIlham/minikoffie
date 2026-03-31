import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, Mail, Lock, ArrowRight } from "lucide-react";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      localStorage.setItem("role", role);

      // Redirect berdasarkan role
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff/orders");
      else navigate("/"); // Arahkan ke reservation page sesuai struktur App Anda
    } catch (err) {
      alert("Login gagal. Periksa kembali email dan password Anda.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-black p-4 rounded-2xl mb-4 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
            <Coffee className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">WELCOME BACK</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">MiniKoffie Member</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-bold"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-bold"
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
          >
            {loading ? "Authenticating..." : "Login Now"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm font-medium">Belum punya akun?</p>
          <Link to="/register" className="text-black font-black text-xs uppercase tracking-widest mt-2 inline-block border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
            Buat Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}