import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import router from './routes';
import apiKeyMiddleware from './middlewares/apiKeyMiddleware';

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());
app.use(apiKeyMiddleware);

app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
