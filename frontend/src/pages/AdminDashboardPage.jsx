import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Calendar, PieChart as PieIcon, AlertTriangle, ArrowRight 
} from "lucide-react";

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

// --- Helpers ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

// --- Sub-Components ---
const TrendBadge = ({ value }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
      isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
    }`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}%
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, isSmall }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      <TrendBadge value={trend} />
    </div>
    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{title}</p>
    <h2 className={`${isSmall ? 'text-sm' : 'text-2xl'} font-black text-gray-900 leading-tight break-words`}>
      {value}
    </h2>
  </div>
);

// --- Main Component ---
export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [topMenus, setTopMenus] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (start = "", end = "") => {
    try {
      setLoading(true);
      const query = start && end ? `?start=${start}&end=${end}` : "";
      
      const [resSummary, resDaily, resTop, resLowStock] = await Promise.all([
        api.get(`/admin/income-summary${query}`),
        api.get(`/admin/income-daily${query}`),
        api.get(`/admin/top-menus${query}`),
        api.get(`/admin/low-stock`)
      ]);

      setSummary(resSummary.data);
      setDailyData(Array.isArray(resDaily.data) ? resDaily.data : []);
      setTopMenus(Array.isArray(resTop.data) ? resTop.data : []);
      setLowStock(Array.isArray(resLowStock.data) ? resLowStock.data : []);
    } catch (err) {
      console.error("Gagal mengambil data dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) return alert("Pilih range tanggal terlebih dahulu");
    fetchData(startDate, endDate);
  };

  const exportReport = () => {
    window.open("http://127.0.0.1:8000/api/admin/export-report", "_blank");
  };

  // --- Memoized Chart Configs ---
  const chartConfigs = useMemo(() => ({
    income: {
      labels: dailyData.map((d) => d.date),
      datasets: [{
        label: "Revenue",
        data: dailyData.map((d) => d.total),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      }],
    },
    transaction: {
      labels: dailyData.map((d) => d.date),
      datasets: [{
        fill: true,
        label: "Jumlah Transaksi",
        data: dailyData.map((d) => d.transaction_count || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      }],
    },
    paymentMethod: {
      labels: summary?.by_method ? Object.keys(summary.by_method).map(m => m.toUpperCase()) : [],
      datasets: [{
        data: summary?.by_method ? Object.values(summary.by_method) : [],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
      }],
    },
    topMenu: {
      labels: topMenus.map((m) => m.name),
      datasets: [{
        label: "Qty Terjual",
        data: topMenus.map((m) => m.total_quantity),
        backgroundColor: "rgba(59,130,246,0.8)",
        borderRadius: 4,
      }],
    }
  }), [dailyData, summary, topMenus]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-gray-500 font-medium">Pantau performa bisnis MiniKoffie secara real-time.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-2 flex-1 lg:flex-none">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm font-bold border-none focus:ring-0 p-0" />
              <ArrowRight size={14} className="text-gray-300 mx-1" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm font-bold border-none focus:ring-0 p-0" />
            </div>
            <button onClick={handleFilter} className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black hover:bg-gray-800 transition-all active:scale-95 w-full lg:w-auto">
              APPLY FILTER
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Income" value={formatRupiah(summary?.total_income)} trend={summary?.growth_revenue} icon={<DollarSign className="text-blue-600"/>} />
          <StatCard title="Transactions" value={summary?.total_transactions} trend={summary?.growth_transactions} icon={<ShoppingBag className="text-emerald-600"/>} />
          <StatCard title="Periode" value={summary ? `${summary.start} - ${summary.end}` : "-"} icon={<Calendar className="text-purple-600"/>} isSmall />
          
          <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
            <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">Avg Order Value</p>
            <h2 className="text-2xl font-black">
              {formatRupiah(summary?.total_income / (summary?.total_transactions || 1))}
            </h2>
          </div>
        </div>

        {/* LOW STOCK ALERT */}
        {lowStock.length > 0 && (
          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 mb-10">
            <h3 className="font-black text-rose-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-600"/> Low Stock Alert
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {lowStock.map((menu) => (
                <div key={menu.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-rose-200">
                  <span className="font-bold text-xs text-gray-700 truncate mr-2">{menu.name}</span>
                  <span className="text-rose-600 font-black text-xs">{menu.stock}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS SECTIONS */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-lg mb-8 text-gray-800">Revenue Performance</h3>
            <div className="h-[250px] mb-8">
              <Bar data={chartConfigs.income} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="h-[150px] pt-6 border-t border-gray-50">
              <Line data={chartConfigs.transaction} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-lg mb-8 text-gray-800 flex items-center gap-2">
              <PieIcon size={18} className="text-blue-600"/> Payments
            </h3>
            <div className="h-[220px] mb-8">
              <Pie data={chartConfigs.paymentMethod} options={{ maintainAspectRatio: false }} />
            </div>
            <div className="space-y-3">
              {summary?.by_method && Object.entries(summary.by_method).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{method}</span>
                  <span className="font-bold text-gray-900 text-xs">{formatRupiah(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP MENU */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl tracking-tight">Menu Terlaris</h3>
            <button 
              onClick={exportReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
            >
              EXPORT REPORT (.CSV)
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="h-[300px]">
              <Bar data={chartConfigs.topMenu} options={{ indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-gray-400 tracking-[0.2em] border-b border-gray-50">
                    <th className="pb-4">Menu</th>
                    <th className="pb-4">Qty</th>
                    <th className="pb-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topMenus.map((menu, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 font-black text-gray-800">{menu.name}</td>
                      <td className="py-4 text-gray-500 font-bold">{menu.total_quantity}</td>
                      <td className="py-4 text-right text-emerald-600 font-black">{formatRupiah(menu.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
                  
      </div>
    </div>
  );
}