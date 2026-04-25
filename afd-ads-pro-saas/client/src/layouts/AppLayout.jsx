import { BarChart3, CreditCard, LayoutDashboard, LogOut, PlusCircle } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[292px_1fr]">
      <aside className="bg-ink p-6 text-white">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-redline font-black">A</div>
          <div>
            <strong className="block text-lg">A.F.D Ads Pro</strong>
            <span className="text-xs text-slate-400">SaaS de performance</span>
          </div>
        </div>

        <nav className="grid gap-2">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/onboarding" icon={<PlusCircle size={18} />} label="Onboarding" />
          <NavItem to="/billing" icon={<CreditCard size={18} />} label="Planos" />
        </nav>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-red-300">Plano atual</p>
          <div className="mt-2 text-2xl font-black">{user?.plan || 'FREE'}</div>
          <button className="mt-4 w-full rounded-lg bg-redline px-3 py-2 text-sm font-black" onClick={() => navigate('/billing')}>
            Upgrade
          </button>
        </div>

        <button className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-300" onClick={logout}>
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="min-w-0 p-6">
        <header className="mb-6 rounded-lg bg-ink p-5 text-white shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Performance marketing</p>
              <h1 className="mt-1 text-3xl font-black">A.F.D Ads Pro</h1>
              <p className="mt-2 text-sm text-slate-300">Dashboard multiusuario com metricas isoladas por conta.</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 text-ink">
              <span className="block text-xs font-black uppercase text-slate-500">Conta</span>
              <strong>{user?.email}</strong>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-black transition ${
          isActive ? 'bg-redline text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
