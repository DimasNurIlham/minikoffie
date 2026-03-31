import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, User, Mail, Lock, UserPlus } from "lucide-react";
import api from "../lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/register", {
        name,
        email,
        password,
      });

      alert("Registrasi berhasil! Silahkan login.");
      navigate("/login");
    } catch (err) {
      alert("Gagal mendaftar. Email mungkin sudah terdaftar.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 w-full max-w-md border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-200 -rotate-3 transition-transform">
            <Coffee className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">JOIN US</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Mulai pengalaman ngopi Anda</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-bold"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-bold"
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
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none font-bold"
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
          >
            {loading ? "Processing..." : "Create Account"}
            <UserPlus size={18} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm font-medium">Sudah punya akun?</p>
          <Link to="/login" className="text-blue-600 font-black text-xs uppercase tracking-widest mt-2 inline-block border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-all">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}