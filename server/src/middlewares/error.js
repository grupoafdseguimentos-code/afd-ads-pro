export function notFound(req, res) {
  res.status(404).json({ message: 'Rota nao encontrada.' });
}

function isDatabaseError(error) {
  return (
    error?.name?.startsWith?.('Prisma') ||
    String(error?.code || '').startsWith('P') ||
    /database|prisma|postgres|connection|connect|timeout/i.test(error?.message || '')
  );
}

function sanitizeErrorMessage(message) {
  return String(message || 'Erro interno no servidor.')
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, 'postgresql://***')
    .replace(/password=([^&\s]+)/gi, 'password=***');
}

export function errorHandler(error, req, res, next) {
  const databaseError = isDatabaseError(error);
  if (databaseError) {
    console.error('Database request failed:', {
      name: error?.name,
      code: error?.code,
      message: sanitizeErrorMessage(error?.message)
    });
  } else {
    console.error(error);
  }

  const status = error.status || (databaseError ? 503 : 500);
  const payload = {
    message: databaseError
      ? 'Banco de dados temporariamente indisponivel. Verifique a conexao PostgreSQL no Railway.'
      : error.message || 'Erro interno no servidor.'
  };

  if (databaseError) {
    payload.code = 'DATABASE_UNAVAILABLE';
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}
