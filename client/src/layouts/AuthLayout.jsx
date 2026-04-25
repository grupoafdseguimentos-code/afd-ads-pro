import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-ink text-white lg:grid-cols-[1fr_520px]">
      <section className="hidden flex-col justify-between p-10 lg:flex">
        <div className="text-2xl font-black">A.F.D Ads Pro</div>
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-redline">Shopee Ads Intelligence</p>
          <h1 className="text-6xl font-black leading-tight">Controle lucro, escala e ROAS como SaaS de verdade.</h1>
          <p className="mt-6 text-lg text-slate-300">Login seguro, planos pagos, dashboard por usuario e dados isolados para vender como produto profissional.</p>
        </div>
        <div className="text-sm text-slate-400">Preto. Branco. Vermelho. Decisao rapida.</div>
      </section>
      <section className="flex items-center justify-center bg-slate-100 p-6 text-ink">
        <Outlet />
      </section>
    </main>
  );
}
