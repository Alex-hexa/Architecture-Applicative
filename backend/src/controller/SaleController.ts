import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { SaleService } from '../service/SaleService.js';
import type { SaleFilters } from '../repository/SaleRepository.js';

export class SaleController {
    constructor(private readonly saleService: SaleService) {}

    private getUserId(req: AuthRequest): string {
        if (!req.user || !req.user.userId) {
            throw new Error("Utilisateur non authentifié.");
        }
        return req.user.userId;
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filters: SaleFilters = {};

            if (req.query.title) filters.title = req.query.title as string;
            if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
            if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
            if (req.query.sortBy) filters.sortBy = req.query.sortBy as 'price' | 'date';
            if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';

            const sales = await this.saleService.getSales(filters);
            
            res.status(200).json(sales);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: AuthRequest, res: Response): Promise<void> {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: "Le corps de la requête est vide ou manquant." });
            return;
        }

        try {
            const userId = this.getUserId(req);

            const saleData = {
                title: req.body.title,
                price: Number(req.body.price),
                description: req.body.description,
                quantity: Number(req.body.quantity),
                categorie: req.body.categorie,
                user_id: userId,
                created_at: new Date()
            };

            const newSale = await this.saleService.createSale(saleData);
            
            res.status(201).json(newSale);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}