import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import transporter from '../lib/mailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

const definePasswordSchema = z.object({
  token: z.string().min(1, { message: 'O token é obrigatório.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

class AdminController {
  async create(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      const existingAdmin = await prisma.admin.findUnique({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      const activationToken = crypto.randomBytes(20).toString('hex');
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const tokenExpires = now;

      await prisma.admin.create({
        data: {
          name,
          email,
          passwordResetToken: activationToken,
          passwordResetExpires: tokenExpires,
        },
      });

      const activationLink = `${process.env.FRONTEND_URL}/define-password?token=${activationToken}`;

      await transporter.sendMail({
        from: '"Equipe NA" <noreply@na-sistema.com>',
        to: email,
        subject: 'Ative sua conta no Sistema NA',
        html: `
          <p>Olá, ${name}!</p>
          <p>Você foi convidado para ser um administrador do sistema do grupo de NA.</p>
          <p>Por favor, clique no link abaixo para definir sua senha e ativar sua conta:</p>
          <a href="${activationLink}">${activationLink}</a>
          <p>Este link expira em 1 hora.</p>
        `,
      });

      return res.status(201).json({
        message:
          'Administrador pré-cadastrado com sucesso. Um e-mail de ativação foi enviado.',
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'Ocorreu um erro ao pré-cadastrar o administrador.' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('Segredo JWT não foi configurado no .env');
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const { email, password } = loginSchema.parse(req.body);

      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin || !admin.password) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      const token = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '8h' });

      return res.json({
        message: 'Login bem-sucedido!',
        accessToken: token,
        refreshToken: token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao fazer login.' });
    }
  }

  async definePassword(req: Request, res: Response) {
    try {
      const { token, password } = definePasswordSchema.parse(req.body);

      const admin = await prisma.admin.findUnique({
        where: { passwordResetToken: token },
      });

      if (!admin) {
        return res.status(400).json({ error: 'Token de ativação inválido.' });
      }

      const now = new Date();
      if (admin.passwordResetExpires && now > admin.passwordResetExpires) {
        return res.status(400).json({ error: 'Token de ativação expirou.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });

      return res
        .status(200)
        .json({
          message: 'Senha definida com sucesso! Você já pode fazer login.',
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: 'Ocorreu um erro ao definir a senha.' });
    }
  }
}

export default new AdminController();
