"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function apiKeyMiddleware(req, res, next) {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Acesso não autorizado: Chave de API inválida' });
    }
    next();
}
exports.default = apiKeyMiddleware;
