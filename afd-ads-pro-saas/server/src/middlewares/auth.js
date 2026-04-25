import { prisma } from '../config/prisma.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Autenticacao obrigatoria.' });

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, plan: true, createdAt: true }
    });

    if (!user) return res.status(401).json({ message: 'Usuario nao encontrado.' });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
}
