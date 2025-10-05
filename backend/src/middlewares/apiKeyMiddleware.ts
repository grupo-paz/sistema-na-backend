import { Request, Response, NextFunction } from 'express';

export default function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  if (!expectedApiKey) {
    console.error('API Key não configurada no servidor.');
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return res
      .status(401)
      .json({ error: 'Acesso não autorizado: API Key inválida.' });
  }

  next();
}
