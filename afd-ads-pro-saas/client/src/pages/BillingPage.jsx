import { CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const plans = [
  { key: 'FREE', price: 'R$0', title: 'Free', features: ['3 anúncios', 'Métricas básicas', 'Dashboard inicial'] },
  { key: 'PRO', price: 'R$49/mês', title: 'Pro', features: ['Anúncios ilimitados', 'Métricas completas', 'Dashboard avançado'] },
  { key: 'ELITE', price: 'R$297/mês', title: 'Elite', features: ['Tudo liberado', 'Prioridade', 'Automações futuras'] }
];

export function BillingPage() {
  const { user } = useAuth();

  async function checkout(plan) {
    if (plan === 'FREE') return;
    const { data } = await api.post('/billing/checkout', { plan });
    window.location.href = data.url;
  }

  return (
    <section className="grid gap-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-redline">Assinatura</p>
          <h2 className="mt-1 text-2xl font-black">Plano atual: {user?.plan}</h2>
          <p className="mt-2 text-sm text-slate-500">Stripe ativa e cancela planos automaticamente via webhook.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map(plan => (
          <article className={`card p-6 ${plan.key === 'PRO' ? 'border-t-4 border-t-redline' : ''}`} key={plan.key}>
            <h3 className="text-2xl font-black">{plan.title}</h3>
            <p className="mt-3 text-3xl font-black">{plan.price}</p>
            <ul className="mt-6 grid gap-3">
              {plan.features.map(feature => (
                <li className="flex items-center gap-2 text-sm font-bold text-slate-600" key={feature}>
                  <CheckCircle2 size={17} className="text-redline" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className={plan.key === user?.plan ? 'btn-dark mt-6 w-full opacity-60' : 'btn-primary mt-6 w-full'} onClick={() => checkout(plan.key)} disabled={plan.key === user?.plan}>
              {plan.key === user?.plan ? 'Plano atual' : 'Fazer upgrade'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
