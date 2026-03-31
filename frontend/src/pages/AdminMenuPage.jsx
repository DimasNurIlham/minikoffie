import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { 
  GripVertical, Edit, Trash2, ToggleLeft, ToggleRight, 
  Plus, Search, Package, Info
} from "lucide-react";

// Drag and Drop Imports
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- HELPER ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

// --- SORTABLE ROW COMPONENT ---
function SortableRow({ menu, openEditModal, handleToggle, handleDelete }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={`group border-b border-gray-50 transition-all ${
        isDragging ? "bg-white shadow-2xl scale-[1.02] ring-1 ring-black/5" : "hover:bg-gray-50/80"
      }`}
    >
      <td className="p-6 w-12 text-center">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-gray-300 group-hover:text-gray-900 transition-colors"
        >
          <GripVertical size={18} />
        </button>
      </td>
      <td className="p-6">
        <div className="flex flex-col">
          <span className="font-black text-gray-900 tracking-tight">{menu.name}</span>
          <span className="text-xs text-gray-400 line-clamp-1 max-w-xs mt-0.5 font-medium italic">
            {menu.description || "Tidak ada deskripsi"}
          </span>
        </div>
      </td>
      <td className="p-6 font-black text-blue-600 tabular-nums">
        {formatRupiah(menu.price)}
      </td>
      <td className="p-6">
        <button 
          onClick={() => handleToggle(menu.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            menu.is_active 
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
            : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}
        >
          {menu.is_active ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
          {menu.is_active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => openEditModal(menu)} 
            className="p-2.5 bg-white text-gray-600 rounded-xl border border-gray-200 hover:border-black hover:text-black transition-all shadow-sm"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => handleDelete(menu.id)} 
            className="p-2.5 bg-white text-rose-500 rounded-xl border border-gray-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// --- MAIN COMPONENT ---
export default function AdminMenuPage() {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "0" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/menus");
      setMenus(res.data);
    } catch (err) {
      console.error("Gagal mengambil menu", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, []);

  const filteredMenus = useMemo(() => {
    return menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [menus, search]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = menus.findIndex((m) => m.id === active.id);
      const newIndex = menus.findIndex((m) => m.id === over.id);
      
      const newOrder = arrayMove(menus, oldIndex, newIndex);
      setMenus(newOrder);

      try {
        await api.post("/admin/menus/reorder", { ids: newOrder.map((m) => m.id) });
      } catch (err) {
        console.error("Gagal simpan urutan baru", err);
      }
    }
  };

  const openAddModal = () => { 
    setEditingMenu(null); 
    setForm({ name: "", description: "", price: "", stock: "0" }); 
    setIsModalOpen(true); 
  };

  const openEditModal = (menu) => { 
    setEditingMenu(menu); 
    setForm({ 
      name: menu.name, 
      description: menu.description || "", 
      price: menu.price,
      stock: menu.stock || "0" 
    }); 
    setIsModalOpen(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) await api.put(`/admin/menus/${editingMenu.id}`, form);
      else await api.post("/admin/menus", form);
      setIsModalOpen(false);
      fetchMenus();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menyimpan menu");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/menus/${id}/toggle`);
      setMenus(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
    } catch { alert("Gagal mengubah status"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await api.delete(`/admin/menus/${id}`);
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch { alert("Gagal menghapus menu"); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Katalog Menu</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 text-sm">
              <Info size={14} className="text-blue-500"/>
              Atur daftar menu dan urutan tampil di aplikasi pelanggan.
            </p>
          </div>
          <button 
            onClick={openAddModal} 
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-[2rem] font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            <Plus size={20}/> TAMBAH MENU
          </button>
        </div>

        {/* CONTROLS SECTION */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm shadow-sm"
            />
          </div>
        </div>

        {/* TABLE SECTION - DndContext di luar table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                  <th className="p-6 w-12"></th>
                  <th className="p-6">Menu & Deskripsi</th>
                  <th className="p-6">Harga</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Aksi</th>
                </tr>
              </thead>
              <SortableContext items={filteredMenus.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-50">
                  {filteredMenus.map((menu) => (
                    <SortableRow 
                      key={menu.id} 
                      menu={menu} 
                      openEditModal={openEditModal} 
                      handleToggle={handleToggle} 
                      handleDelete={handleDelete} 
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
          
          {filteredMenus.length === 0 && (
            <div className="py-24 text-center">
               <Package size={64} className="mx-auto mb-4 text-gray-100" />
               <p className="text-gray-400 font-bold tracking-tight">
                 {search ? `Menu "${search}" tidak ditemukan` : "Belum ada menu di katalog"}
               </p>
               <button onClick={() => setSearch("")} className="text-blue-500 text-xs font-black mt-2 uppercase tracking-widest">Lihat Semua</button>
            </div>
          )}
        </div>

        {/* MODAL SECTION */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">
                  {editingMenu ? "EDIT MENU" : "NEW MENU"}
                </h2>
                <div className="h-1 w-12 bg-black rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Menu</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Produk</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-bold min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">Rp</span>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-black" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stok Awal</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none font-black" required />
                  </div>
                </div>
                <div className="flex gap-4 mt-10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 hover:text-black transition-colors uppercase text-xs tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-black text-white rounded-[1.5rem] font-black hover:bg-gray-800 transition-all shadow-lg active:scale-95 uppercase text-xs tracking-widest">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}