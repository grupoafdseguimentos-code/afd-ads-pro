import { useState } from 'react';
import { api, getApiErrorMessage } from '../services/api.js';

export function OnboardingPage() {
  const [form, setForm] = useState({ name: '', productName: '', sku: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/ads', form);
      await api.post('/metrics', {
        adId: data.ad.id,
        date: new Date().toISOString(),
        impressions: 1000,
        clicks: 35,
        orders: 3,
        spend: 75,
        revenue: 320,
        cost: 120,
        fee: 48,
        freight: 18
      }).catch(() => null);
      setMessage('Anuncio criado. Seu dashboard ja pode receber metricas.');
      setForm({ name: '', productName: '', sku: '' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel criar o anuncio.'));
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <form className="card p-6" onSubmit={submit}>
        <p className="text-xs font-black uppercase tracking-widest text-redline">Primeiro passo</p>
        <h2 className="mt-1 text-2xl font-black">Adicione seu primeiro anuncio</h2>
        <p className="mt-2 text-sm text-slate-500">A conta Free permite ate 3 anuncios. Pro e Elite liberam anuncios ilimitados.</p>
        <div className="mt-6 grid gap-4">
          <input className="input" placeholder="Nome do anuncio" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
          <input className="input" placeholder="Produto" value={form.productName} onChange={event => setForm({ ...form, productName: event.target.value })} />
          <input className="input" placeholder="SKU opcional" value={form.sku} onChange={event => setForm({ ...form, sku: event.target.value })} />
        </div>
        {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-redline">{error}</p>}
        <button className="btn-primary mt-6" type="submit">Criar anuncio</button>
      </form>

      <aside className="card p-6">
        <h3 className="text-xl font-black">Fluxo SaaS pronto</h3>
        <ul className="mt-5 grid gap-3 text-sm text-slate-600">
          <li>1. Criar conta e entrar.</li>
          <li>2. Adicionar anuncio ou importar dados.</li>
          <li>3. Ver CTR, CPC, ROAS e lucro.</li>
          <li>4. Fazer upgrade para liberar tudo.</li>
        </ul>
      </aside>
    </section>
  );
}
