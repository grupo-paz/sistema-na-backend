import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

const eventSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  dateTime: z.string().datetime({ message: 'Formato de data e hora inválido.' }),
  location: z.string().min(1, 'O local é obrigatório.'),
  type: z.string().min(1, 'O tipo é obrigatório.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
});

const updateEventSchema = eventSchema.partial();


class EventController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = eventSchema.parse(req.body);
      const adminId = req.adminId;
      if (!adminId) {
        return res.status(401).json({ error: 'Ação não autorizada.' });
      }

      const event = await prisma.event.create({
        data: {
          ...data,
          authorId: adminId,
        },
      });

      return res.status(201).json(event);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao criar o evento.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          dateTime: 'asc', 
        },
        include: {
          author: {
            select: { name: true },
          },
        },
      });

      return res.json(events);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao listar os eventos.' });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          author: {
            select: { name: true },
          },
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      return res.json(event);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao buscar o evento.' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = updateEventSchema.parse(req.body);

      const event = await prisma.event.update({
        where: { id },
        data: dataToUpdate,
      });

      return res.json(event);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao atualizar o evento.' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const eventExists = await prisma.event.findUnique({ where: { id } });
      if (!eventExists) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      await prisma.event.delete({ where: { id } });

      return res.status(200).json({ message: 'Evento excluído com sucesso.' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao excluir o evento.' });
    }
  }
}

export default new EventController();