const DEFAULT_TIMEOUT_MS = 15000;

function normalizeApiUrl(input) {
  if (!input) return '';

  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, timeout };
}

async function request(url) {
  const { controller, timeout } = withTimeout(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal
    });

    const text = await response.text();
    let body = text;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} em ${url}: ${JSON.stringify(body)}`);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const apiUrl = normalizeApiUrl(process.env.API_URL || process.env.VITE_API_URL);

  if (!apiUrl) {
    throw new Error('Defina API_URL com a URL publica do backend. Ex: API_URL=https://nome-do-servico.up.railway.app');
  }

  if (!/^https?:\/\//.test(apiUrl)) {
    throw new Error(`API_URL precisa ser absoluta. Valor recebido: ${apiUrl}`);
  }

  console.log(`Validando producao em ${apiUrl}`);

  const health = await request(`${apiUrl}/health`);
  if (health !== 'ok' && health?.status !== 'ok') {
    throw new Error(`/api/health respondeu, mas body inesperado: ${JSON.stringify(health)}`);
  }
  console.log('✔ OK /api/health');

  const ready = await request(`${apiUrl}/ready`);
  if (ready.status !== 'ok' || ready.database !== 'connected') {
    throw new Error(`/api/ready respondeu, mas banco nao esta conectado: ${JSON.stringify(ready)}`);
  }
  console.log('✔ OK /api/ready');

  console.log('✔ OK Producao validada: backend online e banco conectado.');
}

main().catch((error) => {
  const reason = error.name === 'AbortError'
    ? 'timeout ao conectar na API'
    : error.message;

  console.error(`❌ ERRO Validacao de producao falhou: ${reason}`);
  process.exit(1);
});
