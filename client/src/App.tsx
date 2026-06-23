import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { useNotificationStore } from './store/notifications';

// Auth
import { LoginPage } from './portals/client/pages/LoginPage';
import { RegisterPage } from './portals/client/pages/RegisterPage';
import { ProLoginPage } from './portals/pro/pages/ProLoginPage';
import { ProRegisterPage } from './portals/pro/pages/ProRegisterPage';

// Client portal
import { ClientLayout } from './portals/client/ClientLayout';
import { HomePage } from './portals/client/pages/HomePage';
import { SalonPage } from './portals/client/pages/SalonPage';
import { AppointmentsPage } from './portals/client/pages/AppointmentsPage';
import { NotificationsPage } from './portals/client/pages/NotificationsPage';

// Pro portal
import { ProLayout } from './portals/pro/ProLayout';
import { CreateSalonPage } from './portals/pro/pages/CreateSalonPage';
import { DashboardPage } from './portals/pro/pages/DashboardPage';
import { AgendaPage } from './portals/pro/pages/AgendaPage';
import { ClientsPage } from './portals/pro/pages/ClientsPage';
import { ServicesPage } from './portals/pro/pages/ServicesPage';
import { EarningsPage } from './portals/pro/pages/EarningsPage';
import { AvailabilityPage } from './portals/pro/pages/AvailabilityPage';
import { ProNotificationsPage } from './portals/pro/pages/ProNotificationsPage';

function RequireAuth({ children, role }: { children: React.ReactNode; role: 'client' | 'professional' }) {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);

  if (!token || !user) {
    return <Navigate to={role === 'professional' ? '/pro/login' : '/login'} replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'professional' ? '/pro' : '/app'} replace />;
  }
  return <>{children}</>;
}

function RequireProSalon({ children }: { children: React.ReactNode }) {
  const salon = useAuthStore(s => s.salon);
  if (!salon) return <Navigate to="/pro/create-salon" replace />;
  return <>{children}</>;
}

export default function App() {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const refreshMe = useAuthStore(s => s.refreshMe);
  const fetchNotifications = useNotificationStore(s => s.fetch);

  useEffect(() => {
    if (token) {
      refreshMe();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60_000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={
        !token ? <Navigate to="/login" /> :
        user?.role === 'professional' ? <Navigate to="/pro" /> :
        <Navigate to="/app" />
      } />

      {/* Client auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Pro auth */}
      <Route path="/pro/login" element={<ProLoginPage />} />
      <Route path="/pro/register" element={<ProRegisterPage />} />

      {/* Pro onboarding */}
      <Route path="/pro/create-salon" element={
        <RequireAuth role="professional"><CreateSalonPage /></RequireAuth>
      } />

      {/* Client portal */}
      <Route path="/app" element={
        <RequireAuth role="client"><ClientLayout /></RequireAuth>
      }>
        <Route index element={<HomePage />} />
        <Route path="salon/:id" element={<SalonPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Pro portal */}
      <Route path="/pro" element={
        <RequireAuth role="professional">
          <RequireProSalon>
            <ProLayout />
          </RequireProSalon>
        </RequireAuth>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="notifications" element={<ProNotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
