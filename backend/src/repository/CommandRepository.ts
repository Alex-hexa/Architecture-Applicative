import { createClient } from '@supabase/supabase-js';
import type { Command } from '../models/CommandModel.js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export interface CommandFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
}

export class CommandRepository {
    async create(userId: string, saleId: string): Promise<Command> {
        const { data: command, error: commandError } = await supabase
            .from('command')
            .insert([{ user_id: userId, status: 'En cours', date: new Date() }])
            .select()
            .single();

        if (commandError) throw new Error(`Erreur création commande: ${commandError.message}`);

        const { error: linkError } = await supabase
            .from('command_sale')
            .insert([{ command_id: command.id, sale_id: saleId }]);

        if (linkError) throw new Error(`Erreur liaison article: ${linkError.message}`);

        return command as Command;
    }

    async findAllByUser(userId: string, filters: CommandFilters): Promise<Command[]> {
        let query = supabase
            .from('command')
            .select(`
                *,
                sale:command_sale(sale(*))
            `)
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.startDate) {
            query = query.gte('date', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate);
        }

        query = query.order('date', { ascending: false });

        const { data, error } = await query;
        if (error) throw new Error(`Erreur récupération commandes: ${error.message}`);

        return data as any[];
    }
}