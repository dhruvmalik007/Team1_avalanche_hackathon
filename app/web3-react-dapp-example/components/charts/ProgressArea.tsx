"use client";

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export type ProgressPoint = { t: number; pct: number; msg?: string };

export default function ProgressArea({ data }: { data: ProgressPoint[] }) {
  const formatted = useMemo(
    () => data.map((d) => ({
      t: new Date(d.t).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      pct: Math.max(0, Math.min(100, d.pct)),
      msg: d.msg,
    })),
    [data]
  );

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f1f23" strokeDasharray="3 3" />
          <XAxis dataKey="t" stroke="#a1a1aa" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#a1a1aa" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#0b0b0e', border: '1px solid #27272a' }} />
          <Area type="monotone" dataKey="pct" stroke="#6d28d9" fillOpacity={1} fill="url(#colorPct)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
