import dotenv from 'dotenv';
dotenv.config();

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

app.use(cors(corsOptions)); 
app.use(express.json());   
app.use(apiKeyMiddleware); 

app.use(router); 

export default app;