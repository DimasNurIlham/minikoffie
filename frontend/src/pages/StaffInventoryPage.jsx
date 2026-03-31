import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { 
  Package, 
  PlusCircle, 
  Search, 
  AlertCircle, 
  Utensils, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react";

export default function StaffInventoryPage() {
  const [menus, setMenus] = useState([]);
  const [restockQty, setRestockQty] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/staff/menus");
      // Mendukung struktur data res.data.data atau res.data
      const data = res.data.data ? res.data.data : res.data;
      setMenus(Array.isArray(data) ? data : []);
    } catch {
      alert("Gagal mengambil data inventaris");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Filter Search Logic
  const filteredMenus = useMemo(() => {
    return menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [menus, search]);

  const restock = async (id) => {
    const qty = restockQty[id];
    if (!qty || qty <= 0) return alert("Masukkan jumlah restock yang valid");

    try {
      await api.post(`/staff/menus/${id}/restock`, { quantity: qty });
      
      // Update local state secara cerdas agar tidak perlu full reload
      setMenus(prev => prev.map(m => 
        m.id === id ? { ...m, stock: parseInt(m.stock) + parseInt(qty) } : m
      ));

      setRestockQty(prev => ({ ...prev, [id]: "" }));
      
      // Notifikasi sukses kecil (bisa diganti toast)
      console.log(`Berhasil restock menu ID: ${id}`);
    } catch {
      alert("Gagal melakukan restock");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic flex items-center gap-3 uppercase">
              <Package size={32} /> Inventory
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Stok & Manajemen Bahan Baku</p>
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm shadow-sm"
            />
          </div>
        </header>

        {/* INVENTORY TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                <th className="p-6">Nama Menu</th>
                <th className="p-6">Status Stok</th>
                <th className="p-6">Restock Qty</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMenus.map((menu) => {
                const isLow = menu.stock <= 5;
                const isEmpty = menu.stock <= 0;

                return (
                  <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isLow ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400'}`}>
                          <Utensils size={20} />
                        </div>
                        <span className="font-black text-gray-900 tracking-tight text-sm uppercase">{menu.name}</span>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black tabular-nums ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                          {menu.stock}
                        </span>
                        {isLow && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse ${isEmpty ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
                            {isEmpty ? 'Habis' : 'Menipis'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-6">
                      <div className="relative w-32">
                        <input
                          type="number"
                          placeholder="0"
                          value={restockQty[menu.id] || ""}
                          onChange={(e) => setRestockQty({ ...restockQty, [menu.id]: e.target.value })}
                          className="w-full bg-gray-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-black transition-all outline-none font-black text-sm text-center"
                        />
                      </div>
                    </td>

                    <td className="p-6 text-right">
                      <button
                        onClick={() => restock(menu.id)}
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                      >
                        <TrendingUp size={14} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMenus.length === 0 && (
            <div className="p-20 text-center">
              <div className="flex flex-col items-center gap-2 opacity-20">
                <AlertCircle size={48} />
                <p className="font-black text-lg tracking-tight uppercase">Menu tidak ditemukan</p>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-8 flex justify-center items-center gap-2 text-gray-400">
           <CheckCircle2 size={14} />
           <p className="text-[10px] font-bold uppercase tracking-widest italic">Semua perubahan stok tercatat di log sistem</p>
        </footer>
      </div>
    </div>
  );
}