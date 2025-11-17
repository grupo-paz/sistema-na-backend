import { Request, Response, NextFunction } from 'express';

function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  
  if (req.method === 'OPTIONS') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Acesso não autorizado: Chave de API inválida' });
  }
  
  next();
}

export default apiKeyMiddleware;