import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import transporter from '../lib/mailer';

const prisma = new PrismaClient();

class AdminController {
  async create(req: Request, res: Response) {
    // TODO: Adicionar um middleware de autenticação

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

      const activationLink = `http://localhost:3000/define-password?token=${activationToken}`; //usando localhost por enquanto

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
}

export default new AdminController();
