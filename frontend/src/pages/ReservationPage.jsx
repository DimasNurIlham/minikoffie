import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Calendar, Layers, MapPin, CheckCircle2, Armchair } from "lucide-react";
import React from "react";

// --- KOMPONEN KURSI (Original Style) ---
const Chair = ({ position }) => {
  const baseStyle = "absolute w-8 h-3 bg-gray-300 border border-gray-600 rounded-sm shadow-sm";
  const styles = {
    top: "-top-5 left-1/2 -translate-x-1/2",
    bottom: "-bottom-5 left-1/2 -translate-x-1/2",
    left: "-left-5 top-1/2 -translate-y-1/2 w-3 h-8",
    right: "-right-5 top-1/2 -translate-y-1/2 w-3 h-8",
  };
  return <div className={`${baseStyle} ${styles[position]}`} />;
};

export default function ReservationPage() {
  const [time, setTime] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFloor, setActiveFloor] = useState(1);
  const navigate = useNavigate();

  // 🔐 Proteksi Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // LayoutMap Original (Tetap Sesuai Data Anda)
  const layoutMap = {
    TS1: { top: "5%", left: "8%", type: "square", seats: 2, floor: 2 },
    TS2: { top: "12%", left: "85%", type: "square", seats: 2, floor: 2 },
    TS3: { top: "32%", left: "85%", type: "square", seats: 4, floor: 2 },
    TS4: { top: "50%", left: "85%", type: "square", seats: 4, floor: 2 },
    TS5: { top: "68%", left: "85%", type: "square", seats: 4, floor: 2 },
    TF1: { top: "60%", left: "90%", type: "square", seats: 2, floor: 1 },
    SO1: { top: "75%", left: "50%", type: "round", seats: 2, floor: 1 },
    SO2: { top: "75%", left: "80%", type: "round", seats: 2, floor: 1 },
    TO1: { top: "82%", left: "30%", type: "round", seats: 4, floor: 1 },
    TO2: { top: "82%", left: "70%", type: "round", seats: 4, floor: 1 },
  };

  const fetchTables = async () => {
    if (!time) return alert("Silakan pilih waktu terlebih dahulu");
    setLoading(true);
    try {
      const formattedTime = time.replace("T", " ");
      const res = await api.get(`/tables/status?time=${formattedTime}`);
      setTables(res.data.tables || []);
      setSelectedTables([]);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data meja");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Perbaikan fungsi toggleTable agar tidak error
  const toggleTable = (table) => {
    if (!table || table.status === "reserved") return;

    setSelectedTables((prev) => {
      if (prev.includes(table.id)) {
        return prev.filter((id) => id !== table.id);
      } else {
        return [...prev, table.id];
      }
    });
  };

  const createReservation = async () => {
    if (selectedTables.length === 0) return alert("Pilih minimal 1 meja");
    setLoading(true);
    try {
      const res = await api.post("/reservations", {
        reservation_time: time,
        table_ids: selectedTables,
      });
      navigate(`/join/${res.data.data.join_code}`);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Gagal membuat reservasi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, isSelected) => {
    if (status === "reserved") return "bg-rose-500 border-rose-700 text-white cursor-not-allowed";
    if (isSelected) return "bg-black border-black text-white scale-110 shadow-xl z-50";
    return "bg-white border-gray-800 text-gray-800 hover:bg-gray-100 hover:scale-105";
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-10 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">Book Your Table</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <MapPin size={12}/> MiniKoffie Floor Plan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 w-full md:w-auto">
            <Calendar size={18} className="text-gray-400 ml-2" />
            <input 
              type="datetime-local" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm font-black border-none focus:ring-0 p-1 flex-1 md:flex-none"
            />
            <button 
              onClick={fetchTables} 
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : "CHECK"}
            </button>
          </div>
        </div>

        {/* FLOOR SELECTOR */}
        <div className="flex gap-4">
          {[1, 2].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`flex-1 py-5 rounded-t-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                activeFloor === f 
                  ? "bg-black text-white shadow-2xl" 
                  : "bg-gray-200 text-gray-400 hover:bg-gray-300"
              }`}
            >
              <Layers size={14} className="inline mr-2" /> Lantai {f}
            </button>
          ))}
        </div>

        {/* CONTAINER DENAH (STRUKTUR DENAH ASLI TETAP DIJAGA) */}
        <div className="bg-white rounded-b-[3rem] rounded-tr-[3rem] shadow-2xl overflow-hidden border-4 border-black relative h-[700px]">
          <div className={`w-full h-full relative transition-colors duration-500 ${activeFloor === 1 ? 'bg-[#fffdf5]' : 'bg-[#f3f4f6]'}`}>

            {/* DENAH LANTAI 1 */}
            {activeFloor === 1 && (
              <>
                <div className="absolute top-0 left-0 w-32 h-16 border-r-2 border-b-2 border-black bg-gray-100 flex items-center justify-center text-xs font-bold shadow-sm uppercase tracking-tighter"> WASTAFEL </div>
                <div className="absolute top-16 left-0 w-32 h-64 border-r-2 border-b-2 border-black bg-gray-200 flex flex-col items-center justify-center shadow-inner"> <span className="transform -rotate-90 text-gray-600 font-bold tracking-widest text-lg"> TANGGA </span> </div>
                <div className="absolute top-0 right-0 w-64 h-16 border-l-2 border-b-2 border-black bg-white flex items-center justify-center font-bold text-sm shadow-sm"> BATHROOM </div>
                <div className="absolute top-16 right-0 w-64 h-32 border-l-2 border-b-2 border-black bg-white flex items-center justify-center font-serif text-xl font-bold tracking-widest text-gray-400 shadow-sm"> KITCHEN </div>
                <div className="absolute top-48 right-48 w-16 h-48 border-b-2 border-black bg-gray-800 shadow-md"></div>
                <div className="absolute top-[320px] right-0 w-48 h-16 border-t-2 border-b-2 border-black bg-gray-800 text-white flex items-center justify-center font-bold tracking-[0.3em] z-10 shadow-md"> BAR </div>
                <div className="absolute top-[40%] left-[40%] transform -rotate-45 text-6xl font-serif font-bold text-gray-200 select-none uppercase"> LT 1 </div>
                <div className="absolute top-[66%] left-0 w-full h-1 bg-black"></div>
                <div className="absolute top-[65%] left-10 w-24 h-4 bg-white border-2 border-black flex items-center justify-center text-[10px] font-bold shadow-sm"> PINTU </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gray-400/50 font-bold tracking-[0.5em] text-xl uppercase"> Outdoor Area </div>
              </>
            )}

            {/* DENAH LANTAI 2 */}
            {activeFloor === 2 && (
              <>
                <div className="absolute top-20 left-0 w-32 h-64 border-r-2 border-t-2 border-b-2 border-black bg-gray-100 flex flex-col items-center justify-center shadow-inner"> <span className="transform -rotate-90 text-gray-500 font-bold tracking-widest text-lg"> TURUN </span> </div>
                <div className="absolute top-[45%] left-[40%] transform -rotate-45 text-6xl font-serif font-bold text-gray-300 select-none uppercase"> LT 2 </div>
                <div className="absolute bottom-0 w-full h-[32%] border-t-2 border-black bg-gray-200 flex items-center justify-center shadow-inner"> <span className="text-gray-500 font-bold text-xl tracking-widest uppercase"> Outside View </span> </div>
              </>
            )}

            {/* RENDER MEJA */}
            {tables.map((table) => {
              const layout = layoutMap[table.code];
              if (!layout || layout.floor !== activeFloor) return null;
              const isSelected = selectedTables.includes(table.id);
              const isReserved = table.status === "reserved";

              return (
                <div
                  key={table.id}
                  onClick={() => toggleTable(table)}
                  style={{ top: layout.top, left: layout.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isReserved ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Chair position="top" />
                  <Chair position="bottom" />
                  {layout.seats > 2 && <><Chair position="left" /><Chair position="right" /></>}

                  <div className={`
                    relative z-10 flex items-center justify-center font-black text-xs border-2 transition-all duration-300
                    ${layout.type === 'round' ? 'w-16 h-16 rounded-full' : 'w-16 h-16 rounded-lg'}
                    ${getStatusColor(table.status, isSelected)}
                  `}>
                    {table.code}
                    {isSelected && <CheckCircle2 size={12} className="absolute -top-1 -right-1 text-white bg-black rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FLOATING ACTION BAR */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white/80 backdrop-blur-xl border border-gray-100 p-4 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 z-50">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 font-black text-[10px] uppercase text-gray-400 tracking-widest">
                <div className="w-3 h-3 rounded-full border border-black bg-white" /> Available
              </div>
              <div className="flex items-center gap-2 font-black text-[10px] uppercase text-gray-400 tracking-widest">
                <div className="w-3 h-3 rounded-full bg-black" /> Selected
              </div>
              <div className="flex items-center gap-2 font-black text-[10px] uppercase text-gray-400 tracking-widest">
                <div className="w-3 h-3 rounded-full bg-rose-500" /> Reserved
              </div>
            </div>

            <button
              onClick={createReservation}
              disabled={selectedTables.length === 0 || loading}
              className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                selectedTables.length > 0
                  ? "bg-black text-white hover:bg-gray-800 shadow-xl shadow-black/20"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "PROCESSING..." : `RESERVE ${selectedTables.length} TABLES`}
              {selectedTables.length > 0 && <CheckCircle2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}