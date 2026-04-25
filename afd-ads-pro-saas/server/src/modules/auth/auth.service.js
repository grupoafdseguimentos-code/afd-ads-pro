import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import {
  generateResetToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../../utils/tokens.js';

const tokenSelect = {
  id: true,
  email: true,
  plan: true,
  createdAt: true
};

export async function register({ email, password }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const error = new Error('Email ja cadastrado.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, plan: 'FREE' },
    select: tokenSelect
  });

  return issueTokens(user);
}

export async function login({ email, password }) {
  const userWithHash = await prisma.user.findUnique({ where: { email } });
  if (!userWithHash) {
    const error = new Error('Credenciais invalidas.');
    error.status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(password, userWithHash.passwordHash);
  if (!ok) {
    const error = new Error('Credenciais invalidas.');
    error.status = 401;
    throw error;
  }

  const user = {
    id: userWithHash.id,
    email: userWithHash.email,
    plan: userWithHash.plan,
    createdAt: userWithHash.createdAt
  };

  return issueTokens(user);
}

export async function refresh(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!stored) {
    const error = new Error('Refresh token invalido.');
    error.status = 401;
    throw error;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() }
  });

  return issueTokens(stored.user);
}

export async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { resetToken: null };

  const resetToken = generateResetToken();
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashToken(resetToken),
      passwordResetAt: expiresAt
    }
  });

  return { resetToken };
}

export async function resetPassword({ token, password }) {
  const tokenHash = hashToken(token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetAt: { gt: new Date() }
    }
  });

  if (!user) {
    const error = new Error('Token de recuperacao invalido ou expirado.');
    error.status = 400;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      passwordResetToken: null,
      passwordResetAt: null
    }
  });
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const decoded = verifyRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    createdAt: user.createdAt
  };
}
