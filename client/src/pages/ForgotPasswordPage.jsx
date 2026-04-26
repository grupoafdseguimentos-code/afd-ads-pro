import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Se o email existir, as instrucoes serao enviadas.');
    } catch {
      setError('Nao foi possivel conectar ao servidor. Tente novamente em instantes.');
    }
  }

  return (
    <form className="card w-full max-w-md p-8" onSubmit={submit}>
      <h2 className="text-3xl font-black">Recuperar senha</h2>
      <p className="mt-2 text-sm text-slate-500">Informe o email da conta.</p>
      <input className="input mt-6" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)} />
      {message && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm font-bold">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-redline">{error}</p>}
      <button className="btn-primary mt-6 w-full" type="submit">Enviar instrucoes</button>
      <Link to="/login" className="mt-5 block text-sm font-bold text-redline">Voltar para login</Link>
    </form>
  );
}
