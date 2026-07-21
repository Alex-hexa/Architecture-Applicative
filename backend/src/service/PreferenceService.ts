import type { PreferenceRepository } from '../repository/PreferenceRepository.js';
import type { Preference } from '../models/PreferenceModel.js';

export class PreferenceService {
    constructor(private readonly preferenceRepository: any) {}

    async getUserPreferences(userId: string): Promise<Preference[]> {
        return this.preferenceRepository.findByUserId(userId);
    }

    async recordInteraction(userId: string, saleId: string, weight: number): Promise<Preference> {
        return this.preferenceRepository.upsert(userId, saleId, weight);
    }

    async removeInteraction(userId: string, saleId: string): Promise<void> {
        return this.preferenceRepository.delete(userId, saleId);
    }
}