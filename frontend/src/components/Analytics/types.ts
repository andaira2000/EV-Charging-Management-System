// Shape of GET /analytics/?days=N (see backend/myapp/views/analytics_views.py).

export interface AnalyticsSummary {
  revenue: number;
  bookings: number;
  avg_session_minutes: number;
  utilisation: number; // 0-1
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD, London time
  revenue: number;
  bookings: number;
}

export interface StationPoint {
  station_id: number;
  location: string;
  bookings: number;
  revenue: number;
}

export interface BusyHourCell {
  weekday: number; // 1 = Monday ... 7 = Sunday
  hour: number; // 0-23, London time
  bookings: number;
}

export interface SellerAnalytics {
  days: number;
  station_count: number;
  summary: AnalyticsSummary;
  previous: AnalyticsSummary;
  daily: DailyPoint[];
  stations: StationPoint[];
  busy_hours: BusyHourCell[];
}
