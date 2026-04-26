import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';
import { API_URL, HAS_API_URL } from '../config.js';
import { api } from '../services/api.js';

export function ApiConnectionStatus() {
  const [status, setStatus] = useState(HAS_API_URL ? 'checking' : 'missing-config');

  async function checkApi() {
    if (!HAS_API_URL) {
      setStatus('missing-config');
      return;
    }

    setStatus('checking');
    try {
      await api.get('/health');
      setStatus('online');
    } catch {
      setStatus('offline');
    }
  }

  useEffect(() => {
    checkApi();

    function handleConnectionError() {
      setStatus(HAS_API_URL ? 'offline' : 'missing-config');
    }

    window.addEventListener('afd-api-connection-error', handleConnectionError);
    return () => window.removeEventListener('afd-api-connection-error', handleConnectionError);
  }, []);

  if (status === 'online') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-lg border border-red-200 bg-white p-4 text-ink shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${status === 'checking' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-redline'}`}>
            {status === 'checking' ? <Wifi size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <strong className="block text-sm">
              {status === 'checking' ? 'Conectando com a API...' : status === 'missing-config' ? 'URL da API nao configurada' : 'Servidor temporariamente indisponivel'}
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              {status === 'checking' && `Verificando ${API_URL}/health`}
              {status === 'missing-config' && 'Configure VITE_API_URL na Vercel com a URL publica do Railway.'}
              {status === 'offline' && 'Nao conseguimos falar com o servidor. O painel continua aberto, mas login, metricas e checkout dependem da API online.'}
            </p>
          </div>
        </div>
        <button className="btn-dark inline-flex items-center gap-2" type="button" onClick={checkApi}>
          <RefreshCw size={15} /> Testar novamente
        </button>
      </div>
    </div>
  );
}
