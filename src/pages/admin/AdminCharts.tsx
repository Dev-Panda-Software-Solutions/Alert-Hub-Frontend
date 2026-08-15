import React from 'react';

// Single-series magnitude bars — one brand hue throughout (this is one series
// faceted by category label, not multiple identities, so no per-bar color coding).
export const BarList: React.FC<{ title: string; rows: Array<{ label: string; count: number }>; emptyText?: string }> = ({ title, rows, emptyText }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText || 'No data yet.'}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 w-28 shrink-0 truncate" title={r.label}>{r.label}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white w-8 text-right shrink-0">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 14-day daily signup counts — one sequential hue, bar height = magnitude.
export const GrowthChart: React.FC<{ points: Array<{ date: string; count: number }> }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">New signups — last 14 days</h3>
      {points.length === 0 ? (
        <p className="text-sm text-slate-500">No data yet.</p>
      ) : (
        <div className="flex items-end gap-1.5 h-20">
          {points.map((p) => (
            <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <span className="text-[10px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 whitespace-nowrap">
                {p.count}
              </span>
              <div
                className="w-full rounded-t bg-indigo-500 min-h-[3px] transition-all"
                style={{ height: `${Math.max(4, (p.count / max) * 100)}%` }}
                title={`${p.date}: ${p.count} signup${p.count !== 1 ? 's' : ''}`}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
};
