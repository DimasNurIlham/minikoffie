import { useEffect, useState } from "react";
import api from "../lib/api";
import { Ticket, Calendar, Clock, Armchair, ArrowRight, Coffee } from "lucide-react";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-reservations");
      setReservations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "confirmed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-600 border-rose-100";
      case "completed": return "bg-gray-50 text-gray-500 border-gray-100";
      default: return "bg-gray-50 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FDFCFB]">
        <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-10 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">My Journeys</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Riwayat reservasi MiniKoffie Anda</p>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Ticket size={32} />
            </div>
            <h3 className="font-black text-xl tracking-tight">Belum Ada Tiket</h3>
            <p className="text-gray-400 text-sm mt-2">Sepertinya Anda belum merencanakan kunjungan.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
            >
              Book Table Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="group bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden hover:border-black transition-all duration-500"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Info Utama */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-black text-white p-2 rounded-xl">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Join Code</span>
                        <h2 className="text-2xl font-black tracking-tighter font-mono text-blue-600">{r.join_code}</h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Calendar size={16} className="text-gray-300" />
                        {new Date(r.start_time).toLocaleDateString("id-ID", { dateStyle: 'medium' })}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Clock size={16} className="text-gray-300" />
                        {new Date(r.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex flex-row md:flex-col justify-between items-end gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(r.status)}`}>
                      {r.status}
                    </span>
                    
                    <button 
                      onClick={() => window.location.href = `/join/${r.join_code}`}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors"
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Footer Tiket (Daftar Meja) */}
                <div className="bg-gray-50/50 px-8 py-4 border-t border-dashed border-gray-200 flex flex-wrap gap-2 items-center">
                  <Armchair size={14} className="text-gray-400 mr-2" />
                  {r.tables.map((t) => (
                    <span
                      key={t.id}
                      className="bg-white border border-gray-200 text-gray-900 px-3 py-1 rounded-lg text-[10px] font-black shadow-sm"
                    >
                      MEJA {t.code}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    <Coffee size={12} /> MiniKoffie
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <div className="mt-12 flex justify-center">
           <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">Enjoy Your Coffee Session</p>
        </div>
      </div>
    </div>
  );
}