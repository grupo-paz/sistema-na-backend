import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

const secretariatSchema = z.object({
  cashValue: z.number().min(0, 'O valor em dinheiro não pode ser negativo.'),
  pixValue: z.number().min(0, 'O valor em Pix não pode ser negativo.'),
});

class SecretariatController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { cashValue, pixValue } = secretariatSchema.parse(req.body);
      const adminId = req.adminId;
      if (!adminId) {
        return res.status(401).json({ error: 'Ação não autorizada.' });
      }

      const newRecord = await prisma.secretariatRecord.create({
        data: {
          cashValue,
          pixValue,
          authorId: adminId,
        },
      });

      return res.status(201).json(newRecord);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao salvar o registro da secretaria.' });
    }
  }

  async getLatest(req: Request, res: Response) {
    try {
      const latestRecord = await prisma.secretariatRecord.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!latestRecord) {
        return res.json({
          cashValue: 0,
          pixValue: 0,
          createdAt: null,
          author: { name: 'N/A' },
        });
      }

      return res.json(latestRecord);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao buscar os dados da secretaria.' });
    }
  }
}

export default new SecretariatController();