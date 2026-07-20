import type { Response } from 'express';
import { getUserId, type AuthRequest } from '../middlewares/AuthMiddleware.js';
import { PreferenceService } from '../service/PreferenceService.js';

export class PreferenceController {
    constructor(private readonly preferenceService: PreferenceService) {}

    async getMyPreferences(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = getUserId(req);
            const preferences = await this.preferenceService.getUserPreferences(userId);
            res.status(200).json(preferences);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addInteraction(req: AuthRequest, res: Response): Promise<void> {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: "Le corps de la requête est vide ou manquant." });
            return;
        }

        try {
            const userId = getUserId(req);
            const { sale_id, weight } = req.body;

            if (!sale_id || typeof weight !== 'number') {
                res.status(400).json({ error: "L'ID de l'annonce et le poids sont requis." });
                return;
            }

            const updatedPreference = await this.preferenceService.recordInteraction(userId, sale_id, weight);
            res.status(200).json(updatedPreference);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
