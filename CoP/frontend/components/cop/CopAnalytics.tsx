'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type KpiSnapshot = {
  map_score?: number;
  nps_score?: number;
  active_users?: number;
  dbu_usage?: number;
};

type KpiSeries = {
  metricDate: string;
  metricName: string;
  metricValue: number;
}[];

type CopAnalyticsProps = {
  copId: string;
};

export default function CopAnalytics({ copId }: CopAnalyticsProps) {
  const { data: snapshot } = useQuery({
    queryKey: ['kpi-snapshot', copId],
    queryFn: () => api<KpiSnapshot>(`/cops/${copId}/kpis/snapshot`),
  });

  const { data: series } = useQuery({
    queryKey: ['kpi-series', copId],
    queryFn: () => api<KpiSeries>(`/cops/${copId}/kpis/series`),
  });

  // Transform series data for charts
  const mapData = series
    ?.filter((s) => s.metricName === 'map_score')
    .map((s) => ({
      date: new Date(s.metricDate).toLocaleDateString(),
      value: s.metricValue,
    })) || [];

  const npsData = series
    ?.filter((s) => s.metricName === 'nps_score')
    .map((s) => ({
      date: new Date(s.metricDate).toLocaleDateString(),
      value: s.metricValue,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {snapshot?.map_score !== undefined && (
          <div className="border rounded-lg p-4">
            <div className="text-sm text-slate-500">MAP Score</div>
            <div className="text-2xl font-bold mt-1">{snapshot.map_score.toFixed(1)}</div>
          </div>
        )}
        {snapshot?.nps_score !== undefined && (
          <div className="border rounded-lg p-4">
            <div className="text-sm text-slate-500">NPS Score</div>
            <div className="text-2xl font-bold mt-1">{snapshot.nps_score.toFixed(0)}</div>
          </div>
        )}
        {snapshot?.active_users !== undefined && (
          <div className="border rounded-lg p-4">
            <div className="text-sm text-slate-500">Active Users</div>
            <div className="text-2xl font-bold mt-1">{snapshot.active_users}</div>
          </div>
        )}
        {snapshot?.dbu_usage !== undefined && (
          <div className="border rounded-lg p-4">
            <div className="text-sm text-slate-500">DBU Usage</div>
            <div className="text-2xl font-bold mt-1">{snapshot.dbu_usage.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Charts */}
      {mapData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4">MAP Score Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" name="MAP Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {npsData.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4">NPS Score Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={npsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-100, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10b981" name="NPS Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!snapshot && mapData.length === 0 && npsData.length === 0 && (
        <div className="text-slate-500">No KPI data available yet.</div>
      )}
    </div>
  );
}
