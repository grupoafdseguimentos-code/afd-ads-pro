import { useEffect, useMemo, useState } from 'react';
import { BarChart3, MousePointerClick, Target, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const fallback = {
  totals: { ctr: 0, cpc: 0, roas: 0, spend: 0, revenue: 0, profit: 0, clicks: 0, orders: 0 },
  series: [],
  ads: [],
  access: { advancedMetrics: false, plan: 'FREE' }
};

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(fallback);

  useEffect(() => {
    api.get('/metrics/dashboard').then(response => setData(response.data)).catch(() => setData(fallback));
  }, []);

  const cards = useMemo(() => [
    { label: 'CTR', value: percent(data.totals.ctr), icon: MousePointerClick },
    { label: 'CPC', value: money(data.totals.cpc), icon: Target },
    { label: 'ROAS', value: number(data.totals.roas), icon: TrendingUp },
    { label: 'Lucro', value: money(data.totals.profit), icon: BarChart3 }
  ], [data]);

  const empty = data.ads.length === 0;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(card => <MetricCard key={card.label} {...card} />)}
      </section>

      {!data.access.advancedMetrics && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-redline p-5">
          <div>
            <strong className="text-lg">Métricas avançadas bloqueadas no plano {user?.plan}</strong>
            <p className="text-sm text-slate-500">Faça upgrade para liberar dashboard avançado e anúncios ilimitados.</p>
          </div>
          <a href="/billing" className="btn-primary">Ver planos</a>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <article className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-redline">Receita vs investimento</p>
              <h2 className="text-xl font-black">Evolução de performance</h2>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series}>
                <CartesianGrid stroke="#E5E7EB" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={value => money(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="spend" stroke="#E53935" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#00C853" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card p-5">
          <p className="text-xs font-black uppercase tracking-widest text-redline">Ação rápida</p>
          <h2 className="mt-1 text-xl font-black">Onboarding</h2>
          {empty ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-5">
              <strong>Adicione seu primeiro anúncio</strong>
              <p className="mt-2 text-sm text-slate-500">Cadastre uma campanha para começar a medir CTR, CPC, ROAS e lucro.</p>
              <a className="btn-dark mt-5 inline-flex" href="/onboarding">Começar</a>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {data.ads.slice(0, 5).map(ad => (
                <div className="rounded-lg border border-slate-200 p-3" key={ad.adId}>
                  <strong className="block truncate">{ad.name}</strong>
                  <span className="text-sm text-slate-500">ROAS {number(ad.roas)} · Lucro {money(ad.profit)}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <article className="card border-t-4 border-t-ink p-5">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-black uppercase text-slate-500">{label}</span>
          <strong className="mt-3 block text-3xl font-black">{value}</strong>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-redline">
          <Icon size={19} />
        </div>
      </div>
    </article>
  );
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function percent(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(Number(value || 0));
}

function number(value) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
}
