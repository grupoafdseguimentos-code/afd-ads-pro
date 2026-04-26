export function notFound(req, res) {
  res.status(404).json({ message: 'Rota nao encontrada.' });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  const status = error.status || 500;
  const payload = {
    message: error.message || 'Erro interno no servidor.'
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}
