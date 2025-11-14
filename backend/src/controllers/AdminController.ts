import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import transporter from '../lib/mailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
interface AuthenticatedRequest extends Request {
  adminId?: string;
}

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>?/`~]).{8,}$/
);

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'O refresh token é obrigatório.' }),
});

const definePasswordSchema = z.object({
  token: z.string().min(1, { message: 'O token é obrigatório.' }),
  password: z.string()
             .min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
             .regex(passwordValidation, {
                message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo especial.'
             }),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'A senha atual é obrigatória.' }),
  newPassword: z.string()
               .min(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
               .regex(passwordValidation, {
                  message: 'A nova senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo especial.'
               }),
});

const updateAdminSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.').optional(),
  email: z.string().email('O formato do e-mail é inválido.').optional(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'E-mail inválido.' }),
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
        html: `<p>Olá, ${name}!</p><p>Clique no link para definir sua senha: <a href="${activationLink}">${activationLink}</a></p>`,
      });

      return res.status(201).json({
        message: 'Administrador pré-cadastrado com sucesso. Um e-mail de ativação foi enviado.',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao pré-cadastrar o administrador.' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const { email, password } = loginSchema.parse(req.body);
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin?.password) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      const accessToken = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '7d' });

      return res.json({
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        message: 'Login bem-sucedido!',
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
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
        return res.status(400).json({ error: 'Token de ativação/recuperação inválido.' });
      }

      const now = new Date();
      if (admin.passwordResetExpires && now > admin.passwordResetExpires) {
        return res.status(400).json({ error: 'Token de ativação/recuperação expirou.' });
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

      return res.status(200).json({ message: 'Senha definida com sucesso! Você já pode fazer login.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      return res.status(500).json({ error: 'Ocorreu um erro ao definir a senha.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

      const admins = await prisma.admin.findMany({
        where: {
          email: {
            not: superAdminEmail
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(admins);
    } catch (error){
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao listar os administradores.' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = updateAdminSchema.parse(req.body);
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

      const adminToUpdate = await prisma.admin.findUnique({ where: { id } });
      if (adminToUpdate?.email === superAdminEmail) {
        return res.status(403).json({ error: 'Não é permitido editar o super administrador.' });
      }

      if (dataToUpdate.email) {
        const emailExists = await prisma.admin.findFirst({
          where: {
            email: dataToUpdate.email,
            id: { not: id },
          },
        });
        if (emailExists) {
          return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }
      }

      const updatedAdmin = await prisma.admin.update({
        where: { id },
        data: dataToUpdate,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...adminWithoutPassword } = updatedAdmin;
      return res.json(adminWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao atualizar o administrador.' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const loggedAdminId = req.adminId;
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

      if (id === loggedAdminId) {
        return res.status(400).json({ error: 'Você não pode excluir a sua própria conta.' });
      }

      const adminToDelete = await prisma.admin.findUnique({ where: { id } });
      if (!adminToDelete) {
        return res.status(404).json({ error: 'Administrador não encontrado.' });
      }

      if (adminToDelete.email === superAdminEmail) {
        return res.status(403).json({ error: 'O super administrador não pode ser excluído.' });
      }
      
      await prisma.admin.delete({ where: { id } });
      return res.status(200).json({ message: 'Administrador excluído com sucesso.' });
    } catch (error){
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao excluir o administrador.' });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId;
      if (!adminId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!admin) {
        return res.status(404).json({ error: 'Administrador não encontrado.' });
      }

      return res.json(admin);
    } catch (error){
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao buscar o perfil do administrador.' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.adminId;
      
      if (!adminId) {
        return res.status(401).json({ error: 'Não autorizado.' });
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const admin = await prisma.admin.findUnique({
        where: { id: adminId }
      });

      if (!admin?.password) {
        return res.status(404).json({ error: 'Administrador não encontrado.' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta.' });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword },
      });

      return res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao alterar a senha.' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }

      const { refreshToken } = refreshTokenSchema.parse(req.body);

      try {
        const decoded = jwt.verify(refreshToken, jwtSecret) as { id: string };

        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        if (!admin) {
          return res.status(401).json({ error: 'Refresh token inválido.' });
        }

        const newAccessToken = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '7d' });

        return res.json({
          admin,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (jwtError) {
        console.error("Erro ao verificar refresh token:", jwtError);
        return res.status(401).json({ error: 'Refresh token inválido ou expirado.' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error("Erro em refreshToken:", error);
      return res.status(500).json({ error: 'Ocorreu um erro ao renovar o token.' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin) {
        return res.status(200).json({ message: 'Se um utilizador com este e-mail existir, um link de recuperação foi enviado.' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const tokenExpires = now;

      await prisma.admin.update({
        where: { email },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: tokenExpires,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/define-password?token=${resetToken}`;

      await transporter.sendMail({
        from: '"Equipe NA" <noreply@na-sistema.com>',
        to: admin.email,
        subject: 'Recuperação de Senha - Sistema NA',
        html: `<p>Olá, ${admin.name}!</p><p>Clique no link para redefinir sua senha: <a href="${resetLink}">${resetLink}</a></p>`,
      });

      return res.status(200).json({ message: 'Se um utilizador com este e-mail existir, um link de recuperação foi enviado.' });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(200).json({ message: 'Se um utilizador com este e-mail existir, um link de recuperação foi enviado.' });
      }
      console.error("Erro em forgotPassword:", error);
      return res.status(500).json({ error: 'Ocorreu um erro ao processar o pedido de recuperação de senha.' });
    }
  }
}

export default new AdminController();