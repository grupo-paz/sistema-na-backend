import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import express from 'express';
import cors from 'cors';
import router from './routes';
import apiKeyMiddleware from './middlewares/apiKeyMiddleware';

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization, x-api-key"
};

const app = express();
const PORT = 3333;

app.use(cors(corsOptions));

app.use(express.json());
app.use(apiKeyMiddleware);

app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
