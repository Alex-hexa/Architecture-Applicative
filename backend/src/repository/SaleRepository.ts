import { createClient } from '@supabase/supabase-js';
import type { Sale } from '../models/SaleModel.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export interface SaleFilters {
    title?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date';
    sortOrder?: 'asc' | 'desc';
}

export class SaleRepository {
    async findAll(filters: SaleFilters): Promise<Sale[]> {
        let query = supabase.from('sale').select('*');

        if (filters.title) {
            query = query.ilike('title', `%${filters.title}%`);
        }
        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }

        if (filters.sortBy) {
            const column = filters.sortBy === 'date' ? 'created_at' : 'price';
            query = query.order(column, { ascending: filters.sortOrder === 'asc' });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erreur lors de la récupération des annonces : ${error.message}`);
        }

        return data as Sale[];
    }
}