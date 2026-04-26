import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getApiErrorMessage } from '../services/api.js';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/auth/reset-password', form);
      setMessage('Senha atualizada. Voce ja pode entrar.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Token invalido ou expirado.'));
    }
  }

  return (
    <form className="card w-full max-w-md p-8" onSubmit={submit}>
      <h2 className="text-3xl font-black">Nova senha</h2>
      <p className="mt-2 text-sm text-slate-500">Cole o token recebido e defina uma nova senha.</p>
      <div className="mt-6 grid gap-4">
        <input className="input" placeholder="Token de recuperacao" value={form.token} onChange={event => setForm({ ...form, token: event.target.value })} />
        <input className="input" type="password" placeholder="Nova senha" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
      </div>
      {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-redline">{error}</p>}
      <button className="btn-primary mt-6 w-full" type="submit">Atualizar senha</button>
      <Link to="/login" className="mt-5 block text-sm font-bold text-redline">Voltar para login</Link>
    </form>
  );
}
