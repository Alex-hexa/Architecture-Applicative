import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { CommandService } from '../service/CommandService.js';
import type { CommandFilters } from '../repository/CommandRepository.js';
import { z } from 'zod';

const createCommandSchema = z.object({
    sale_id: z.string().min(1, "L'ID de l'annonce est requis.")
});

export class CommandController {
    constructor(private readonly commandService: CommandService) {}

    private getUserId(req: AuthRequest): string {
        if (!req.user || !req.user.userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        return req.user.userId;
    }

    async create(req: AuthRequest, res: Response): Promise<void> {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: "Le corps de la requête est vide ou manquant." });
            return;
        }

        try {
            const userId = this.getUserId(req);
            const validatedData = createCommandSchema.parse(req.body);
            const newCommand = await this.commandService.createCommand(userId, validatedData.sale_id);
            res.status(201).json(newCommand);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues.map(e => e.message).join(' | ') });
                return;
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(400).json({ error: "Une erreur inattendue est survenue." });
        }
    }

    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req);

            const filters: CommandFilters = {};
            if (req.query.status) filters.status = req.query.status as string;
            if (req.query.startDate) filters.startDate = req.query.startDate as string;
            if (req.query.endDate) filters.endDate = req.query.endDate as string;

            const commands = await this.commandService.getUserCommands(userId, filters);
            res.status(200).json(commands);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}