import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

const meetingSchema = z.object({
  dayOfWeek: z.string().min(1, 'O dia da semana é obrigatório.'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'O formato do horário deve ser HH:MM.'),
  type: z.string().min(1, 'O tipo é obrigatório.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  roomOpener: z.string().min(1, 'O abridor de sala é obrigatório.'),
});

const updateMeetingSchema = meetingSchema.partial();
const daysOfWeekMap: { [key: number]: string } = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado"
};

class MeetingController {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const data = meetingSchema.parse(req.body);
      const adminId = req.adminId;

      if (!adminId) {
        return res.status(401).json({ error: 'Ação não autorizada.' });
      }

      const meeting = await prisma.meeting.create({
        data: {
          ...data,
          authorId: adminId,
        },
      });

      return res.status(201).json(meeting);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao criar a reunião.' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const meetings = await prisma.meeting.findMany({
        orderBy: {
          dayOfWeek: 'asc',
        },
      });
      return res.json(meetings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao listar as reuniões.' });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meeting = await prisma.meeting.findUnique({
        where: { id },
      });

      if (!meeting) {
        return res.status(404).json({ error: 'Reunião não encontrada.' });
      }
      return res.json(meeting);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao buscar a reunião.' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const dataToUpdate = updateMeetingSchema.parse(req.body);

      const meeting = await prisma.meeting.update({
        where: { id },
        data: dataToUpdate,
      });

      return res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ issues: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao atualizar a reunião.' });
    }
  }
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const meetingExists = await prisma.meeting.findUnique({ where: { id } });
      if (!meetingExists) {
        return res.status(404).json({ error: 'Reunião não encontrada.' });
      }

      await prisma.meeting.delete({ where: { id } });

      return res.status(200).json({ message: 'Reunião excluída com sucesso.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao excluir la reunião.' });
    }
  }
  async getTodayMeetings(req: Request, res: Response) {
    try {
      const todayIndex = new Date().getDay();
      const todayName = daysOfWeekMap[todayIndex];

      if (!todayName) {
        return res.status(500).json({ error: 'Não foi possível determinar o dia da semana.' });
      }

      const meetings = await prisma.meeting.findMany({
        where: {
          dayOfWeek: todayName,
        },
        orderBy: {
          time: 'asc',
        },
      });
      return res.json(meetings);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocorreu um erro ao buscar as reuniões do dia.' });
    }
  }
}

export default new MeetingController();