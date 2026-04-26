import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel entrar. Confira email e senha.'));
    }
  }

  return (
    <form className="card w-full max-w-md p-8" onSubmit={submit}>
      <h2 className="text-3xl font-black">Entrar</h2>
      <p className="mt-2 text-sm text-slate-500">Acesse o painel SaaS do A.F.D Ads Pro.</p>
      <div className="mt-6 grid gap-4">
        <input className="input" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Senha" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-redline">{error}</p>}
      <button className="btn-primary mt-6 w-full" type="submit">Entrar</button>
      <div className="mt-5 flex justify-between text-sm font-bold">
        <Link to="/forgot-password">Esqueci a senha</Link>
        <Link to="/register" className="text-redline">Criar conta</Link>
      </div>
    </form>
  );
}
