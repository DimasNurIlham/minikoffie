import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { 
  Banknote, QrCode, CreditCard, ShoppingCart, 
  ChevronLeft, Plus, Minus, CheckCircle, 
  AlertCircle, UtensilsCrossed 
} from "lucide-react";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

export default function JoinPage() {
  const { code } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reservation, setReservation] = useState(null);
  const [order, setOrder] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingItems, setProcessingItems] = useState(new Set());

  const isPaid = order?.status === "paid";

  const fetchJoinData = useCallback(async () => {
    try {
      const res = await api.get(`/join/${code}`);
      setReservation(res.data.reservation);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [code]);

  const fetchMenus = async () => {
    const res = await api.get(`/menus`);
    setMenus(res.data);
  };

  useEffect(() => {
    if (!code) return;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchJoinData(), fetchMenus()]);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Kode akses tidak valid atau pesanan tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [code, fetchJoinData]);

  // Auto refresh tiap 5 detik jika belum bayar
  useEffect(() => {
    if (!code || isPaid) return;
    const interval = setInterval(() => { fetchJoinData(); }, 5000);
    return () => clearInterval(interval);
  }, [code, isPaid, fetchJoinData]);

  const getOrderItem = (menuId) => order?.items?.find((item) => item.menu_id === menuId);

  const handleIncrease = async (menuId) => {
    if (isPaid) return;
    setProcessingItems((prev) => new Set(prev).add(menuId));
    try {
      await api.post(`/order-items`, { order_id: order.id, menu_id: menuId, quantity: 1 });
      await fetchJoinData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal menambah pesanan");
    } finally {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(menuId);
        return next;
      });
    }
  };

  const handleDecrease = async (menuId) => {
    if (isPaid) return;
    const item = getOrderItem(menuId);
    if (!item) return;
    setProcessingItems((prev) => new Set(prev).add(menuId));
    try {
      if (item.quantity > 1) {
        await api.put(`/order-items/${item.id}`, { quantity: item.quantity - 1 });
      } else {
        await api.delete(`/order-items/${item.id}`);
      }
      await fetchJoinData();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Gagal mengurangi pesanan");
    } finally {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(menuId);
        return next;
      });
    }
  };

  const handlePay = async () => {
    if (!order || isPaid) return;
    if (!window.confirm(`Konfirmasi pembayaran via ${paymentMethod.toUpperCase()}?`)) return;

    try {
      await api.post(`/orders/${order.id}/pay`, { method: paymentMethod });
      await fetchJoinData();
      alert("Pembayaran terkonfirmasi! Silahkan tunggu pesanan Anda.");
    } catch (err) {
      alert(err.response?.data?.message || "Proses pembayaran gagal");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-xl font-black text-gray-900">{error}</h2>
      <button onClick={() => window.location.href = '/'} className="mt-6 text-sm font-bold border-b-2 border-black">Kembali ke Beranda</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-44">
      
      {/* HEADER: STATUS MEJA */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-2xl">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight italic">TABLE ORDER</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Reservation #{reservation?.id}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {reservation?.tables?.map((t) => (
              <span key={t.id} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-wider">
                Meja {t.code}
              </span>
            ))}
          </div>
        </div>
        
        {isPaid && (
          <div className="bg-emerald-500 text-white p-2 text-center text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <CheckCircle size={12} /> Transaction Completed
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8 mt-4">
        
        {/* CURRENT ORDERS (Jika Ada) */}
        {order?.items?.length > 0 && (
          <section className="animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Pesanan Anda</h2>
              <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-md border text-gray-500 italic">Auto-sync active</span>
            </div>
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-blue-600 border border-gray-100">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm tracking-tight">{item.menu.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatRupiah(item.price)}</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-sm">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
              <div className="p-4 bg-gray-50/50 flex justify-between items-center px-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-lg text-blue-600 tracking-tight">{formatRupiah(order.total_price)}</span>
              </div>
            </div>
          </section>
        )}

        {/* MENU LIST */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Pilihan Menu</h2>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menus.map((menu) => {
              const orderItem = getOrderItem(menu.id);
              const quantity = orderItem ? orderItem.quantity : 0;
              const isProcessing = processingItems.has(menu.id);
              const lowStock = menu.stock <= 5;

              return (
                <div key={menu.id} className={`group bg-white border border-gray-100 rounded-[2rem] p-5 flex flex-col justify-between transition-all duration-300 ${isPaid ? "opacity-50 grayscale pointer-events-none" : "hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{menu.name}</h3>
                      <p className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-2 italic leading-relaxed">{menu.description}</p>
                    </div>
                    {lowStock && !isPaid && (
                      <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-2 py-1 rounded-md border border-rose-100 uppercase animate-pulse">Low Stock</span>
                    )}
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900 tabular-nums">{formatRupiah(menu.price)}</span>
                    
                    {quantity === 0 ? (
                      <button 
                        onClick={() => handleIncrease(menu.id)} 
                        disabled={isProcessing || isPaid || menu.stock === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:bg-gray-200"
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                        <button 
                          onClick={() => handleDecrease(menu.id)} 
                          disabled={isProcessing || isPaid}
                          className="w-8 h-8 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-rose-50 transition-colors active:scale-90 disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-sm min-w-[24px] text-center text-gray-900">{quantity}</span>
                        <button 
                          onClick={() => handleIncrease(menu.id)} 
                          disabled={isProcessing || isPaid || menu.stock <= quantity}
                          className="w-8 h-8 bg-white text-emerald-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-emerald-50 transition-colors active:scale-90 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* FOOTER CHECKOUT: FLOATING GLASSMORPHISM */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 animate-in slide-in-from-bottom-10 duration-700">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Total Section */}
            <div className="flex items-center gap-5 w-full md:w-auto border-b md:border-b-0 pb-4 md:pb-0 border-gray-100">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</p>
                <p className="text-2xl font-black text-gray-900 tracking-tighter tabular-nums leading-none mt-1">
                  {formatRupiah(order?.total_price || 0)}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto w-full md:w-auto">
              {[
                { id: "cash", icon: <Banknote size={16} /> },
                { id: "qris", icon: <QrCode size={16} /> },
                { id: "card", icon: <CreditCard size={16} /> },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={isPaid}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    paymentMethod === method.id
                      ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {method.icon} {method.id}
                </button>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handlePay}
              disabled={isPaid || !order?.items?.length}
              className={`w-full md:w-auto px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${
                isPaid
                  ? "bg-emerald-500 text-white cursor-default"
                  : "bg-black text-white hover:bg-gray-800 shadow-black/20"
              }`}
            >
              {isPaid ? "ALREADY PAID" : "CHECKOUT NOW"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}