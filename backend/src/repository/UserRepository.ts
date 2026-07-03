import { createClient } from '@supabase/supabase-js';
import type { User } from '../models/UserModel.js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) return null;
        return data as User;
    }

    async create(user: Omit<User, 'id'>): Promise<User> {
        const { data, error } = await supabase
            .from('user')
            .insert([user])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création de l'utilisateur : ${error.message}`);
        }
        return data as User;
    }
}