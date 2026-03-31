import { useEffect, useState } from "react";
import api from "../lib/api";
import { ChefHat, Clock, CheckCircle2, Flame, Bell, Utensils } from "lucide-react";

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/staff/orders");
      // Mendukung struktur res.data.data atau res.data
      const data = res.data.data ? res.data.data : res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => { fetchOrders(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/staff/orders/${id}/status`, { status });
      fetchOrders();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal update status");
    }
  };

  const groupOrders = (status) => orders.filter((order) => order.status === status);

  const OrderCard = ({ order }) => {
    // Hitung berapa lama pesanan sudah dibuat
    const waitTime = Math.floor((new Date() - new Date(order.created_at)) / 60000);

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-5 transition-all hover:shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Ticket</span>
            <span className="text-lg font-black text-gray-900">#{order.id}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
               Meja: {order.reservation?.tables?.map((t) => t.code).join(", ") || "N/A"}
            </span>
            <div className="flex items-center gap-1 justify-end mt-1 text-gray-400 font-bold text-[10px]">
               <Clock size={10} /> {waitTime}m ago
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 bg-gray-50 p-3 rounded-2xl">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-gray-200/50 last:border-0 pb-1 last:pb-0">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                {item.menu.name}
              </span>
              <span className="h-6 w-6 bg-black text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                {item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {order.status === "paid" && (
            <button
              onClick={() => updateStatus(order.id, "cooking")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <Flame size={14} /> Start Cooking
            </button>
          )}

          {order.status === "cooking" && (
            <button
              onClick={() => updateStatus(order.id, "ready")}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              <CheckCircle2 size={14} /> Mark as Ready
            </button>
          )}

          {order.status === "ready" && (
            <button
              onClick={() => updateStatus(order.id, "served")}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Bell size={14} /> Mark Served
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#F9FAFB]">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic flex items-center gap-3 uppercase">
            <ChefHat size={32} /> KDS System
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Real-time Kitchen Display</p>
        </div>
        <div className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          Kitchen Online
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KOLOM PAID / NEW */}
        <section className="bg-blue-50/30 p-2 rounded-[2.5rem] border border-blue-100/50">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">New Orders</h2>
            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
              {groupOrders("paid").length}
            </span>
          </div>
          <div className="px-2">
            {groupOrders("paid").map((order) => <OrderCard key={order.id} order={order} />)}
            {groupOrders("paid").length === 0 && (
              <EmptyState icon={<Utensils />} text="No new orders" />
            )}
          </div>
        </section>

        {/* KOLOM COOKING */}
        <section className="bg-emerald-50/30 p-2 rounded-[2.5rem] border border-emerald-100/50">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Cooking</h2>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
              {groupOrders("cooking").length}
            </span>
          </div>
          <div className="px-2">
            {groupOrders("cooking").map((order) => <OrderCard key={order.id} order={order} />)}
            {groupOrders("cooking").length === 0 && (
              <EmptyState icon={<Flame />} text="Kitchen is quiet" />
            )}
          </div>
        </section>

        {/* KOLOM READY */}
        <section className="bg-gray-100/30 p-2 rounded-[2.5rem] border border-gray-200/50">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Ready to Serve</h2>
            <span className="bg-gray-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
              {groupOrders("ready").length}
            </span>
          </div>
          <div className="px-2">
            {groupOrders("ready").map((order) => <OrderCard key={order.id} order={order} />)}
            {groupOrders("ready").length === 0 && (
              <EmptyState icon={<CheckCircle2 />} text="Everything served" />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-300">
      <div className="mb-2 opacity-20">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{text}</p>
    </div>
  );
}