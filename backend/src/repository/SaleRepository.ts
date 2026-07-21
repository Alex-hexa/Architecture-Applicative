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

    async findById(id: string): Promise<Sale | null> {
        const { data, error } = await supabase
            .from('sale')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return data as Sale;
    }

    async update(id: string, userId: string, updateData: Partial<Sale>): Promise<Sale> {
        const { data, error } = await supabase
            .from('sale')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la mise à jour (ou droits insuffisants) : ${error.message}`);
        }
        return data as Sale;
    }

    async delete(id: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('sale')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Erreur lors de la suppression de l'annonce : ${error.message}`);
        }
    }

    async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
        const { data, error } = await supabase
            .from('sale')
            .insert([sale])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création de l'annonce : ${error.message}`);
        }
        return data as Sale;
    }
}