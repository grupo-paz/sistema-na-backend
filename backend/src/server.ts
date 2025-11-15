import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import express from 'express';
import cors from 'cors';
import router from './routes';
import apiKeyMiddleware from './middlewares/apiKeyMiddleware';

const allowedOrigins = [
  'https://sistema-na-frontend.vercel.app',
  'https://sistema-na-admin.vercel.app'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization, x-api-key"
};

const app = express();
const PORT = 3333;

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(apiKeyMiddleware);

app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});