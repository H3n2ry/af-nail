const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('af_nail_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error ?? 'Unknown error', data.code ?? 'UNKNOWN', res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  constructor(message: string, public code: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role: 'client' | 'professional' }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<{ user: User; salon: Salon | null }>('/auth/me'),
};

// Salons
export const salonApi = {
  search: (q: string) => api.get<{ salons: Salon[] }>(`/salons/search?q=${encodeURIComponent(q)}`),
  create: (data: { name: string; description?: string; address?: string }) =>
    api.post<{ salon: Salon }>('/salons', data),
  get: (id: string) => api.get<{ salon: Salon; professionals: User[] }>(`/salons/${id}`),
  connect: (id: string) => api.post<{ success: boolean }>(`/salons/${id}/connect`, {}),
  services: (id: string) => api.get<{ services: Service[] }>(`/salons/${id}/services`),
  clients: (id: string) => api.get<{ clients: SalonClient[] }>(`/salons/${id}/clients`),
  myConnected: () => api.get<{ salons: Salon[] }>('/salons/my/connected'),
};

// Services
export const serviceApi = {
  create: (data: { name: string; description?: string; price_cents: number; duration_minutes?: number; is_combo?: boolean }) =>
    api.post<{ service: Service }>('/services', data),
  update: (id: string, data: Partial<{
    name: string;
    description: string | null;
    price_cents: number;
    duration_minutes: number;
    is_combo: boolean;
    is_active: boolean;
  }>) =>
    api.patch<{ success: boolean }>(`/services/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/services/${id}`),
  mine: () => api.get<{ services: Service[] }>('/services/mine'),
};

// Availability
export const availabilityApi = {
  get: (professionalId: string) => api.get<{ availability: Availability[] }>(`/professionals/${professionalId}`),
  update: (professionalId: string, data: AvailabilityInput[]) =>
    api.put<{ success: boolean }>(`/professionals/${professionalId}`, data),
  slots: (professionalId: string, date: string) =>
    api.get<{ slots: Slot[]; date: string }>(`/professionals/${professionalId}/slots?date=${date}`),
};

// Appointments
export const appointmentApi = {
  book: (data: {
    salon_id: string;
    professional_id: string;
    service_id: string;
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
  }) => api.post<{ appointment: Appointment }>('/appointments', data),
  list: (role?: 'client' | 'professional') =>
    api.get<{ appointments: AppointmentWithDetails[] }>(`/appointments${role ? `?role=${role}` : ''}`),
  updateStatus: (id: string, status: 'completed' | 'cancelled') =>
    api.patch<{ success: boolean }>(`/appointments/${id}/status`, { status }),
};

// Notifications
export const notificationApi = {
  list: () => api.get<{ notifications: Notification[]; unread_count: number }>('/notifications'),
  markRead: (id: string) => api.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch<{ success: boolean }>('/notifications/read-all', {}),
};

// Dashboard
export const dashboardApi = {
  earnings: (period: 'today' | 'week' | 'month') =>
    api.get<EarningsDashboard>(`/dashboard/earnings?period=${period}`),
  appointments: (period: 'today' | 'week' | 'month') =>
    api.get<AppointmentDashboard>(`/dashboard/appointments?period=${period}`),
};

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'client' | 'professional';
  avatar_url?: string | null;
  created_at?: number;
};

export type Salon = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  created_at?: number;
};

export type Service = {
  id: string;
  salon_id: string;
  professional_id: string;
  professional_name?: string;
  name: string;
  description?: string | null;
  price_cents: number;
  duration_minutes: number;
  is_combo: number;
  is_active: number;
  created_at?: number;
};

export type Availability = {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type AvailabilityInput = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

export type Slot = {
  time: string;
  available: boolean;
};

export type Appointment = {
  id: string;
  salon_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  price_cents: number;
  notes?: string | null;
  created_at?: number;
};

export type AppointmentWithDetails = Appointment & {
  service_name: string;
  duration_minutes: number;
  is_combo: number;
  professional_name?: string;
  client_name?: string;
  client_phone?: string | null;
  salon_name: string;
  salon_id?: string;
};

export type SalonClient = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  total_appointments: number;
  last_appointment?: string | null;
};

export type Notification = {
  id: string;
  appointment_id: string;
  type: 'reminder_2d' | 'reminder_2h' | 'new_booking' | 'cancellation';
  message: string;
  is_read: number;
  scheduled_for: number;
  sent_at?: number | null;
  created_at: number;
};

export type EarningsDashboard = {
  period: string;
  start: string;
  end: string;
  count: number;
  total_cents: number;
  appointments: AppointmentWithDetails[];
  weekly_chart: { week_start: string; total_cents: number }[];
};

export type AppointmentDashboard = {
  period: string;
  start: string;
  end: string;
  count: number;
  today_appointments: AppointmentWithDetails[];
};
