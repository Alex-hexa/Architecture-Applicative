import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/AuthMiddleware.js';
import { SaleService } from '../service/SaleService.js';
import type { SaleFilters } from '../repository/SaleRepository.js';
import jwt from 'jsonwebtoken';

export class SaleController {
    constructor(private readonly saleService: SaleService) {}

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
        try {
            const decodedToken = req.user as jwt.JwtPayload;
            const userId = decodedToken.userId;

            if (!userId) {
                res.status(401).json({ error: "Utilisateur non identifié." });
                return;
            }

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