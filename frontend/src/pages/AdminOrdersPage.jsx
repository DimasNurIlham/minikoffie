import { useEffect, useState } from "react";
import api from "../lib/api";
import { 
  ChevronDown, ChevronUp, Calendar, Hash, 
  Armchair, Receipt, Search, Filter, 
  Clock, CreditCard, CheckCircle2, AlertCircle
} from "lucide-react";
import React from "react";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders");
      const data = res.data.data ? res.data.data : res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data order", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!filterDate) return true;
    const orderDate = new Date(order.created_at).toISOString().split("T")[0];
    return orderDate === filterDate;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
            <p className="text-gray-500 font-medium">Pantau arus transaksi dan detail reservasi pelanggan.</p>
          </div>

          {/* Glassmorphism Filter */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-[2rem] shadow-xl shadow-black/5 border border-white">
            <div className="flex items-center gap-2 px-3 border-r border-gray-100">
              <Calendar size={18} className="text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border-none focus:ring-0 text-sm font-bold bg-transparent p-0 cursor-pointer"
              />
            </div>
            {filterDate ? (
              <button 
                onClick={() => setFilterDate("")} 
                className="bg-rose-50 text-rose-600 text-[10px] font-black px-4 py-2 rounded-full hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest"
              >
                Clear
              </button>
            ) : (
              <div className="pr-4 pl-2">
                <Filter size={16} className="text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                <th className="p-6">ID & Lokasi</th>
                <th className="p-6">Waktu Transaksi</th>
                <th className="p-6">Total Tagihan</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    onClick={() => toggleExpand(order.id)}
                    className={`group transition-all cursor-pointer ${
                      expandedId === order.id ? "bg-blue-50/30" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${expandedId === order.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'} group-hover:bg-black group-hover:text-white transition-all`}>
                          <Hash size={20} />
                        </div>
                        <div>
                          <span className="block font-black text-gray-900 text-lg tracking-tighter">#{order.id}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Armchair size={12} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Meja: {order.reservation?.tables?.map(t => t.code).join(", ") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                        <Clock size={14} className="text-gray-300" />
                        {new Date(order.created_at).toLocaleString("id-ID", { 
                          dateStyle: "medium", 
                          timeStyle: "short" 
                        })}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-lg font-black text-blue-600 tabular-nums">
                        {formatRupiah(order.total_price)}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.status === "paid" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {order.status === "paid" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {order.status}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-block p-2 rounded-xl transition-all ${expandedId === order.id ? 'bg-black text-white rotate-180' : 'bg-gray-50 text-gray-300'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Panel */}
                  {expandedId === order.id && (
                    <tr className="bg-[#FBFBFC]">
                      <td colSpan="5" className="p-8">
                        <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-4 duration-500">
                          
                          {/* Item List Section */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-black text-white rounded-lg"><Receipt size={16}/></div>
                              <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400">Order Summary</h4>
                            </div>
                            <div className="space-y-3">
                              {order.items?.map((item) => (
                                <div key={item.id} className="group flex justify-between items-center bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-gray-400">
                                      {item.quantity}x
                                    </div>
                                    <div>
                                      <p className="font-black text-gray-800 tracking-tight">{item.menu?.name}</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatRupiah(item.price)} / unit</p>
                                    </div>
                                  </div>
                                  <span className="font-black text-gray-900">{formatRupiah(item.subtotal)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Details Section */}
                          <div className="space-y-8">
                            <div>
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-600 text-white rounded-lg"><CreditCard size={16}/></div>
                                <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-400">Transaction Info</h4>
                              </div>
                              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <DetailRow label="Join Code" value={order.reservation?.join_code} isCode />
                                <DetailRow label="Metode Pembayaran" value={order.payment?.method || "Pending"} uppercase />
                                <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
                                  <span className={`text-sm font-black italic ${order.payment ? "text-emerald-500" : "text-rose-500"}`}>
                                    {order.payment ? "PAID FULL" : "UNPAID"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Search size={64} className="mb-4" />
                      <p className="font-black text-xl tracking-tighter italic">Data Tidak Ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean code
function DetailRow({ label, value, isCode, uppercase }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-sm font-bold ${isCode ? 'bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-mono' : 'text-gray-900'} ${uppercase ? 'uppercase tracking-widest' : ''}`}>
        {value || "-"}
      </span>
    </div>
  );
}