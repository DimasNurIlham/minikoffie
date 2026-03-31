import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { Users, UserPlus, Trash2, Shield, Mail, X, Pencil, KeyRound, Loader2, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk form (bisa untuk TAMBAH atau EDIT)
  const [formData, setFormData] = useState({
    id: null, // Jika null, berarti TAMBAH. Jika ada isi, berarti EDIT.
    name: "",
    email: "",
    password: "", // Hanya diisi saat TAMBAH atau RESET PASSWORD
    role: "customer"
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Gagal mengambil data user", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Logic untuk Membuka Modal (Tambah vs Edit) ---
  const openModalForCreate = () => {
    setFormData({ id: null, name: "", email: "", password: "", role: "customer" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (user) => {
    // Isi form dengan data user yang dipilih
    setFormData({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      password: "", // Kosongkan password saat edit (keamanan)
      role: user.role 
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Logic untuk Submit Form (Tambah vs Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        // UPDATE USER EXISTING
        // Jika password kosong, jangan kirim field password
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await api.put(`/admin/users/${formData.id}`, updateData);
      } else {
        // CREATE USER BARU
        await api.post("/admin/users", formData);
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(`Gagal ${formData.id ? 'mengupdate' : 'menambah'} user. ${err.response?.data?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Hapus user ini secara permanen?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menghapus user.");
    }
  };

  // --- Logic Pencarian (Memoized) ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 bg-[#F9FAFB] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users size={32} className="text-blue-600" /> User Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">Kelola hak akses admin, staff, dan pelanggan MiniKoffie.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl w-full md:w-64 text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
            
            <button 
              onClick={openModalForCreate}
              className="bg-black text-white px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-gray-800 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-black/10"
            >
              <UserPlus size={18} /> TAMBAH USER
            </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">User Informasi</th>
                <th className="p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Role Access</th>
                <th className="p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-400 font-medium">
                    <Loader2 className="animate-spin inline mr-2" size={18}/> Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                 <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-400 font-medium">User tidak ditemukan.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-500 text-lg shadow-inner">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-base">{u.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12}/> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 w-fit ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                      u.role === 'staff' ? 'bg-blue-100 text-blue-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Shield size={12}/>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModalForEdit(u)}
                          className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteUser(u.id)}
                          className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Hapus User"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (TAMBAH & EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {formData.id ? "Edit User Account" : "Add New User"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Full Name</label>
                    <input 
                      type="text" name="name" required value={formData.name} onChange={handleInputChange}
                      className="w-full mt-1.5 px-6 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Email Address</label>
                    <input 
                      type="email" name="email" required value={formData.email} onChange={handleInputChange}
                      className="w-full mt-1.5 px-6 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  {/* Bagian Role & Password (Password opsional saat edit) */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Assign Role</label>
                    <div className="relative mt-1.5 ">
                        <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <select 
                          name="role" value={formData.role} onChange={handleInputChange}
                          className="w-full px-6 pl-12 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-black text-sm appearance-none cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff Kitchen</option>
                          <option value="admin">Administrator</option>
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-1.5">
                        <KeyRound size={12}/> {formData.id ? "Reset Password" : "Password"}
                    </label>
                    <input 
                      type="password" name="password" required={!formData.id} // Wajib jika Tambah, opsional jika Edit
                      value={formData.password} onChange={handleInputChange}
                      className="w-full mt-1.5 px-6 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-sm"
                      placeholder={formData.id ? "Isi jika ingin ganti pass" : "••••••••"}
                    />
                  </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-4.5 rounded-2xl font-black text-sm mt-6 hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18}/> : (formData.id ? "UPDATE USER ACCOUNT" : "CREATE USER")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}