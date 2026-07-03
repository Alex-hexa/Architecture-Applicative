import { MockPreferenceRepository } from '../repository/MockPreferenceRepository.js';
import type { Preference } from '../models/PreferenceModel.js';

export class PreferenceService {
    constructor(private readonly preferenceRepository: MockPreferenceRepository) {}

    async getUserPreferences(userId: string): Promise<Preference[]> {
        return this.preferenceRepository.findByUserId(userId);
    }

    async recordInteraction(userId: string, category: string, weight: number): Promise<Preference> {
        // TODO: Ajouter des règles métier complexes ici si besoin
        
        return this.preferenceRepository.upsert(userId, category, weight);
    }
}