import type { CommandFilters } from '../repository/CommandRepository.js';
import { CommandRepository } from '../repository/CommandRepository.js';
import type { Command } from '../models/CommandModel.js';

export class CommandService {
    constructor(private readonly commandRepository: CommandRepository) {}

    async createCommand(userId: string, saleId: string): Promise<Command> {
        if (!saleId) {
            throw new Error("L'identifiant de l'annonce est requis pour passer commande.");
        }
        return this.commandRepository.create(userId, saleId);
    }

    async getUserCommands(userId: string, filters: CommandFilters): Promise<Command[]> {
        return this.commandRepository.findAllByUser(userId, filters);
    }
}