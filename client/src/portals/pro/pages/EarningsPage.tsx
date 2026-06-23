import React, { useState, useEffect } from 'react';
import { dashboardApi, EarningsDashboard } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';

type PeriodTab = 'today' | 'week' | 'month';

const MAX_BAR_HEIGHT = 80; // px

export function EarningsPage() {
  const [period, setPeriod] = useState<PeriodTab>('month');
  const [data, setData] = useState<EarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardApi.earnings(period).then(setData).finally(() => setLoading(false));
  }, [period]);

  const maxWeekly = data ? Math.max(...data.weekly_chart.map(w => w.total_cents), 1) : 1;

  const periodLabels = { today: 'Hoje', week: 'Esta semana', month: 'Este mês' };

  return (
    <div className="page-container pt-4">
      <h2 className="section-title mb-6">Ganhos</h2>

      {/* Period tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 rounded-full p-1">
        {(['today', 'week', 'month'] as PeriodTab[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              period === p ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-primary'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Total card */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-primary to-primary/80 text-white">
        <p className="text-white/70 text-sm mb-1">{periodLabels[period]}</p>
        {loading ? (
          <div className="h-10 bg-white/20 rounded animate-pulse w-32 mb-1" />
        ) : (
          <p className="font-mono font-semibold text-4xl mb-1">{formatCurrency(data?.total_cents ?? 0)}</p>
        )}
        <p className="text-white/70 text-sm">{data?.count ?? 0} atendimento{(data?.count ?? 0) !== 1 ? 's' : ''} concluído{(data?.count ?? 0) !== 1 ? 's' : ''}</p>
      </div>

      {/* Weekly chart */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Últimas 4 semanas</h3>
        {loading ? (
          <div className="h-24 bg-neutral-100 rounded animate-pulse" />
        ) : (
          <div className="flex items-end gap-2 h-24">
            {data?.weekly_chart.map((week, i) => {
              const height = (week.total_cents / maxWeekly) * MAX_BAR_HEIGHT;
              const d = new Date(week.week_start + 'T12:00:00Z');
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-accent">
                    {week.total_cents > 0 ? formatCurrency(week.total_cents).replace('R$\xa0', '') : ''}
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-primary transition-all duration-500"
                    style={{ height: `${Math.max(height, 4)}px` }}
                  />
                  <span className="text-[10px] text-neutral-500">
                    {d.getDate()}/{d.getMonth() + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed appointments list */}
      <div>
        <h3 className="font-display text-lg font-semibold text-neutral-900 mb-3">Atendimentos concluídos</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />)}
          </div>
        ) : data?.appointments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <span className="text-4xl">💸</span>
            <p className="text-neutral-500 text-sm">Nenhum atendimento concluído {period === 'today' ? 'hoje' : period === 'week' ? 'esta semana' : 'este mês'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.appointments.map(appt => (
              <div key={appt.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{appt.client_name}</p>
                  <p className="text-sm text-neutral-500 truncate">{appt.service_name}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(appt.scheduled_date + 'T12:00:00Z').toLocaleDateString('pt-BR')} · {appt.scheduled_time}
                  </p>
                </div>
                <span className="font-mono font-semibold text-accent whitespace-nowrap">
                  {formatCurrency(appt.price_cents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
