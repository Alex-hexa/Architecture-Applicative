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
        try {
            const userId = getUserId(req);
            const { sale_id, weight } = req.body;
            const updatedPreference = await this.preferenceService.recordInteraction(userId, sale_id, weight);
            res.status(200).json(updatedPreference);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeInteraction(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = getUserId(req);
            
            const saleId = req.params.saleId as string;

            if (!saleId) {
                res.status(400).json({ error: "L'ID de l'annonce est requis." });
                return;
            }

            await this.preferenceService.removeInteraction(userId, saleId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}