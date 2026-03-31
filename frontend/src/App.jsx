import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import ReservationPage from "./pages/ReservationPage";
import JoinPage from "./pages/JoinPage";
import LoginPage from "./pages/LoginPage";
import MyReservationsPage from "./pages/MyReservationsPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminReservationPage from "./pages/AdminReservationPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminUsersPage from "./pages/AdminUsersPage";  

import StaffOrdersPage from "./pages/StaffOrdersPage";
import StaffInventoryPage from "./pages/StaffInventoryPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  // Hook untuk mengambil informasi path saat ini
  const location = useLocation();

  // Tentukan path di mana Navbar TIDAK BOLEH muncul
  const hideNavbarPaths = ["/login"];

  return (
    <>
      {/* 1. Navbar hanya muncul jika path saat ini tidak ada di daftar hideNavbarPaths */}
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* 2. Alihkan root path (/) ke /login jika diinginkan sebagai landing page awal */}
        {/* Atau jika user belum login, ProtectedRoute biasanya sudah menangani ini */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* CUSTOMER */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ReservationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join/:code"
          element={
            <ProtectedRoute>
              <JoinPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/menus"
          element={
            <ProtectedRoute>
              <AdminMenuPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute>
              <AdminReservationPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />        

        {/* STAFF */}
        <Route
          path="/staff/orders"
          element={
            <ProtectedRoute>
              <StaffOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/inventory"
          element={
            <ProtectedRoute>
              <StaffInventoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}