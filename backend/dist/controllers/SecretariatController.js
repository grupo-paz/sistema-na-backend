"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const secretariatSchema = zod_1.z.object({
    cashValue: zod_1.z.number().min(0, 'O valor em dinheiro não pode ser negativo.'),
    pixValue: zod_1.z.number().min(0, 'O valor em Pix não pode ser negativo.'),
});
class SecretariatController {
    async create(req, res) {
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
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return res.status(201).json(newRecord);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: error.issues });
            }
            console.error(error);
            return res.status(500).json({ error: 'Ocorreu um erro ao salvar o registro da secretaria.' });
        }
    }
    async getLatest(req, res) {
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
                    author: {
                        id: '',
                        name: 'N/A',
                    },
                });
            }
            return res.json(latestRecord);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Ocorreu um erro ao buscar os dados da secretaria.' });
        }
    }
}
exports.default = new SecretariatController();
