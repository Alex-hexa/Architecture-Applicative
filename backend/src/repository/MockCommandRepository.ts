import type { CommandFilters } from './CommandRepository.js';
import type { Command } from '../models/CommandModel.js';
import { randomUUID } from 'crypto';

export class MockCommandRepository {
    private commands: any[] = [
        {
            id: 'cmd-1',
            user_id: 'user-id-alexandre',
            status: 'En cours',
            date: new Date('2026-07-02T10:00:00Z'),
            sale: [
                {
                    sale: {
                        id: '33333333-3333-3333-3333-333333333333',
                        title: 'Garde de chien (Les Amis à 4 Pattes)',
                        price: 20.00
                    }
                }
            ]
        }
    ];

    async create(userId: string, saleId: string): Promise<Command> {
        const newCommand = {
            id: randomUUID(),
            user_id: userId,
            status: 'En cours',
            date: new Date(),
            sale: [{ sale: { id: saleId, title: 'Article Mocké', price: 0 } }] 
        };
        this.commands.push(newCommand);
        return newCommand as any;
    }

    async findAllByUser(userId: string, filters: CommandFilters): Promise<Command[]> {
        let result = this.commands.filter(c => c.user_id === userId);

        if (filters.status) {
            result = result.filter(c => c.status === filters.status);
        }
        if (filters.startDate) {
            result = result.filter(c => new Date(c.date) >= new Date(filters.startDate!));
        }
        if (filters.endDate) {
            result = result.filter(c => new Date(c.date) <= new Date(filters.endDate!));
        }

        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return result;
    }
}