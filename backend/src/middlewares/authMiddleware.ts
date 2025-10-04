import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

export default function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token com formato inválido.' });
  }

  const [scheme, token] = parts;

  if (!scheme || !token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('Segredo JWT não foi configurado no .env');
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    const { id } = decoded as { id: string };
    req.adminId = id;

    return next();
  });
}
