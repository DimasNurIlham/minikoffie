import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Order() {
  const { reservationId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeOrder = async () => {
      try {
        // 1. Cek dulu: Apakah order sudah ada? (GET)
        const checkRes = await api.get(`/reservations/${reservationId}`);
        const existingOrder = checkRes.data.data.order; // Sesuaikan path data backend Anda

        if (existingOrder) {
          // A. KALAU ADA: Pakai data itu
          console.log("Order sudah ada, memakai data lama.");
          setOrder(existingOrder);
        } else {
          // B. KALAU KOSONG: Buat baru (POST) - Seperti kode lama Anda
          console.log("Order belum ada, membuat baru...");
          const createRes = await api.post("/orders", {
            reservation_id: reservationId,
          });
          setOrder(createRes.data.data);
        }
      } catch (error) {
        console.error("Gagal memproses order:", error);
        alert("Terjadi kesalahan sistem");
      }
    };

    if (reservationId) {
        initializeOrder();
    }
}, [reservationId]);

  const addItem = async () => {
    setLoading(true);
    await api.post(`/orders/${order.id}/items`, {
      menu_id: 1,
      quantity: 1,
    });
    refreshOrder();
    setLoading(false);
  };

  const pay = async () => {
    await api.post(`/orders/${order.id}/pay`);
    refreshOrder();
  };

  const refreshOrder = async () => {
    const res = await api.get(`/orders/${order.id}`);
    setOrder(res.data.data);
  };

  if (!order) return <p>Menyiapkan order...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pesanan</h2>

        <div className="flex justify-between mb-2">
          <span>Status </span>
          <span className="font-semibold">{order.status}</span>
        </div>

        <div className="flex justify-between mb-4">
          <span>Total </span>
          <span className="font-semibold text-green-600">
            Rp {order.total_price}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={addItem}
            disabled={order.status === "paid" || loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Tambah Item
          </button>

          <button
            onClick={pay}
            disabled={order.status === "paid" || loading}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Bayar
          </button>
        </div>

        {order.status === "paid" && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Pesanan telah dibayar
          </p>
        )}
      </div>
    </div>
  );
}
