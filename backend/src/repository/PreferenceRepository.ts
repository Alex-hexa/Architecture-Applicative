import { createClient } from '@supabase/supabase-js';
import type { Preference } from '../models/PreferenceModel.js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export class PreferenceRepository {
    
    async findByUserId(userId: string): Promise<Preference[]> {
        const { data, error } = await supabase
            .from('preference')
            .select('*, sale(*)')
            .eq('user_id', userId);

        if (error) {
            throw new Error(`Erreur lors de la récupération des préférences : ${error.message}`);
        }

        return data as any[];
    }

    async upsert(userId: string, saleId: string, scoreToAdd: number): Promise<Preference> {
        const { data: existingPref, error: searchError } = await supabase
            .from('preference')
            .select('*')
            .eq('user_id', userId)
            .eq('sale_id', saleId)
            .single(); 

        if (searchError && searchError.code !== 'PGRST116') {
            throw new Error(`Erreur vérification préférence : ${searchError.message}`);
        }

        if (existingPref) {
            const newScore = existingPref.score + scoreToAdd;
            
            const { data, error: updateError } = await supabase
                .from('preference')
                .update({ 
                    score: newScore, 
                    last_interaction: new Date() 
                })
                .eq('id', existingPref.id) 
                .select()
                .single();

            if (updateError) throw new Error(`Erreur mise à jour : ${updateError.message}`);
            return data as Preference;

        } else {
            const { data, error: insertError } = await supabase
                .from('preference')
                .insert([{
                    user_id: userId,
                    sale_id: saleId,
                    score: scoreToAdd,
                    last_interaction: new Date()
                }])
                .select()
                .single();

            if (insertError) throw new Error(`Erreur création : ${insertError.message}`);
            return data as Preference;
        }
    }
}