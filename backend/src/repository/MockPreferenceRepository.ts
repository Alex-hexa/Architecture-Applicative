import type { Preference } from '../models/PreferenceModel.js';
import { randomUUID } from 'crypto';

export class MockPreferenceRepository {
    private preferences: Preference[] = [];

    async findByUserId(userId: string): Promise<Preference[]> {
        return this.preferences.filter(p => p.user_id === userId);
    }
    async upsert(userId: string, saleId: string, scoreToAdd: number): Promise<Preference> {
        let pref = this.preferences.find(p => p.user_id === userId && p.sale_id === saleId);

        if (pref) {
            pref.score += scoreToAdd;
            pref.last_interaction = new Date();
        } else {
            pref = {
                id: randomUUID(),
                user_id: userId,
                sale_id: saleId,
                score: scoreToAdd,
                last_interaction: new Date()
            };
            this.preferences.push(pref);
        }
        return pref;
    }
}