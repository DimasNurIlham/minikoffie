import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { 
  Calendar, User, Clock, Armchair, AlertCircle, 
  Search, Filter, CheckCircle2, XCircle, Timer, BarChart3
} from "lucide-react";

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReservations = async (selectedDate = "") => {
    try {
      setLoading(true);
      const url = selectedDate ? `/admin/reservations?date=${selectedDate}` : `/admin/reservations`;
      const res = await api.get(url);
      const data = res.data.data ? res.data.data : res.data;
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  // Statistik Dinamis berdasarkan data yang tampil
  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
    };
  }, [reservations]);

  const handleCancel = async (id) => {
    if (!window.confirm("Yakin ingin membatalkan reservasi ini?")) return;
    try {
      await api.patch(`/admin/reservations/${id}/cancel`);
      fetchReservations(date);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membatalkan");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending": return { color: "bg-amber-50 text-amber-600 border-amber-100", icon: <Timer size={12}/> };
      case "confirmed": return { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <CheckCircle2 size={12}/> };
      case "completed": return { color: "bg-blue-50 text-blue-600 border-blue-100", icon: <BarChart3 size={12}/> };
      case "cancelled": return { color: "bg-rose-50 text-rose-600 border-rose-100", icon: <XCircle size={12}/> };
      default: return { color: "bg-gray-50 text-gray-500 border-gray-100", icon: null };
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Reservations</h1>
            <p className="text-gray-500 font-medium italic">Monitoring jadwal kunjungan pelanggan secara real-time.</p>
          </div>

          {/* Quick Stats Cards */}
          <div className="flex gap-4">
            <QuickStat label="Total" value={stats.total} color="blue" />
            <QuickStat label="Pending" value={stats.pending} color="amber" />
            <QuickStat label="Confirmed" value={stats.confirmed} color="emerald" />
          </div>
        </header>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-xl shadow-black/5 border border-white mb-8">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 flex-1 md:flex-none">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-black text-gray-700 cursor-pointer"
            />
          </div>
          <button
            onClick={() => fetchReservations(date)}
            className="bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Filter Data
          </button>
          {date && (
            <button 
              onClick={() => { setDate(""); fetchReservations(""); }}
              className="text-xs font-black text-rose-500 uppercase tracking-widest px-2"
            >
              Reset
            </button>
          )}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                <th className="p-6">Pelanggan</th>
                <th className="p-6 text-center">Estimasi Waktu</th>
                <th className="p-6 text-center">Alokasi Meja</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map((r) => {
                const config = getStatusConfig(r.status);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 tracking-tight">{r.user?.name || "Guest User"}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{r.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-gray-900 font-black text-sm tabular-nums">
                          <Clock size={14} className="text-blue-500" />
                          {formatTime(r.start_time)}
                        </div>
                        <div className="h-3 w-px bg-gray-200" />
                        <div className="text-gray-400 font-bold text-[10px] tabular-nums">{formatTime(r.end_time)}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap justify-center gap-2">
                        {r.tables?.map((t) => (
                          <span key={t.id} className="inline-flex items-center gap-1.5 bg-white text-gray-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-gray-100 shadow-sm">
                            <Armchair size={10} className="text-blue-500" /> Meja {t.code}
                          </span>
                        )) || <span className="text-gray-300">-</span>}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase border tracking-widest ${config.color}`}>
                        {config.icon}
                        {r.status}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="px-6 py-2.5 bg-white text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                        >
                          Batalkan
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest italic pr-4">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {reservations.length === 0 && (
            <div className="p-24 text-center">
               <div className="flex flex-col items-center gap-4 opacity-10">
                 <AlertCircle size={80} />
                 <p className="text-2xl font-black italic tracking-tighter">Empty Schedule</p>
               </div>
               <button onClick={() => { setDate(""); fetchReservations(""); }} className="mt-4 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">View All Dates</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-komponen Statistik Ringkas
function QuickStat({ label, value, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-xl font-black ${colors[color]}`}>{value}</span>
    </div>
  );
}