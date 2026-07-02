import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { CommandService } from '../service/CommandService.js';
import type { CommandFilters } from '../repository/CommandRepository.js';
import jwt from 'jsonwebtoken';

export class CommandController {
    constructor(private readonly commandService: CommandService) {}

    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const decodedToken = req.user as jwt.JwtPayload;
            const userId = decodedToken.userId;
            const { sale_id } = req.body;

            const newCommand = await this.commandService.createCommand(userId, sale_id);
            res.status(201).json(newCommand);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            const decodedToken = req.user as jwt.JwtPayload;
            const userId = decodedToken.userId;

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