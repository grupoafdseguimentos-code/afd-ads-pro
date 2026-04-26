import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../services/api.js';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/onboarding');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel criar a conta.'));
    }
  }

  return (
    <form className="card w-full max-w-md p-8" onSubmit={submit}>
      <h2 className="text-3xl font-black">Criar conta</h2>
      <p className="mt-2 text-sm text-slate-500">Comece no plano Free e evolua quando precisar.</p>
      <div className="mt-6 grid gap-4">
        <input className="input" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Senha com 8+ caracteres" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-redline">{error}</p>}
      <button className="btn-primary mt-6 w-full" type="submit">Cadastrar</button>
      <p className="mt-5 text-sm font-bold">Ja tem conta? <Link className="text-redline" to="/login">Entrar</Link></p>
    </form>
  );
}
