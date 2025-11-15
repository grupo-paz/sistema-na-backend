"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.production' });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const apiKeyMiddleware_1 = __importDefault(require("./middlewares/apiKeyMiddleware"));
const allowedOrigins = [
    'https://sistema-na-frontend.vercel.app',
    'https://sistema-na-admin.vercel.app'
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Acesso não permitido por CORS'));
        }
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization, x-api-key"
};
const app = (0, express_1.default)();
const PORT = 3333;
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(apiKeyMiddleware_1.default);
app.use(routes_1.default);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
