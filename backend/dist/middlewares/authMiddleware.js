"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
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
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
        const { id } = decoded;
        req.adminId = id;
        return next();
    });
}
