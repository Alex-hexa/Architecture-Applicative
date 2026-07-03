import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { CommandService } from '../service/CommandService.js';
import type { CommandFilters } from '../repository/CommandRepository.js';

export class CommandController {
    constructor(private readonly commandService: CommandService) {}

    private getUserId(req: AuthRequest): string {
        if (!req.user || !req.user.userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        return req.user.userId;
    }

    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req);
            const { sale_id } = req.body;

            const newCommand = await this.commandService.createCommand(userId, sale_id);
            res.status(201).json(newCommand);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
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