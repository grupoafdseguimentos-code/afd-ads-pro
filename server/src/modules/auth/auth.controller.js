import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword
} from './auth.service.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema
} from './auth.schemas.js';

export const registerController = asyncHandler(async (req, res) => {
  const result = await register(registerSchema.parse(req.body));
  res.status(201).json(result);
});

export const loginController = asyncHandler(async (req, res) => {
  const result = await login(loginSchema.parse(req.body));
  res.json(result);
});

export const refreshController = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  res.json(await refresh(refreshToken));
});

export const logoutController = asyncHandler(async (req, res) => {
  await logout(req.body.refreshToken);
  res.status(204).send();
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await forgotPassword(email);
  res.json({
    message: 'Se o email existir, enviaremos instrucoes de recuperacao.',
    resetToken: process.env.NODE_ENV === 'production' ? undefined : result.resetToken
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  await resetPassword(resetPasswordSchema.parse(req.body));
  res.status(204).send();
});
