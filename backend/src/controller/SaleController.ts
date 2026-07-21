import type { Request, Response } from 'express';
import { getUserId, type AuthRequest } from '../middlewares/AuthMiddleware.js';
import { SaleService } from '../service/SaleService.js';
import { PreferenceService } from '../service/PreferenceService.js';
import type { SaleFilters } from '../repository/SaleRepository.js';
import type { Sale } from '../models/SaleModel.js';
import { z } from 'zod';
import { BodyValidationHandler, CategoryValidationHandler, PriceValidationHandler } from '../service/chain/SaleChain.js';

const CATEGORIES_VALIDEES = [
    'Informatique', 'Sport', 'Animaux', 'Service', 
    'Livre', 'Cuisine', 'Vêtement', 'Jeux Vidéo', 'Fourniture'
];

const updateSaleSchema = z.object({
    title: z.string().min(3).optional(),
    price: z.number().min(0).optional(),
    description: z.string().nullable().optional(),
    quantity: z.number().min(0).optional(),
    categorie: z.string().optional(),
    wear_level: z.number().min(0).max(5).optional()
});

export class SaleController {
    constructor(
        private readonly saleService: SaleService,
        private readonly preferenceService: PreferenceService
    ) {}

    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            const filters: SaleFilters = {};

            if (req.query.title) filters.title = req.query.title as string;
            if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
            if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
            if (req.query.sortBy) filters.sortBy = req.query.sortBy as 'price' | 'date';
            if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';

            let userPreferences: any[] = [];
            try {
                const userId = getUserId(req);
                userPreferences = await this.preferenceService.getUserPreferences(userId);
            } catch (error) {
            }

            const sales = await this.saleService.getSales(filters, userPreferences);
            
            res.status(200).json(sales);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: AuthRequest, res: Response): Promise<void> {
        const bodyHandler = new BodyValidationHandler();
        const categoryHandler = new CategoryValidationHandler();
        const priceHandler = new PriceValidationHandler();
        bodyHandler.setNext(categoryHandler).setNext(priceHandler);
        const validationError = bodyHandler.handle(req);
        if (validationError) {
            res.status(400).json({ error: validationError });
            return;
        }

        try {
            const userId = getUserId(req);

            const saleData = {
                title: req.body.title,
                price: Number(req.body.price),
                description: req.body.description,
                quantity: Number(req.body.quantity),
                categorie: req.body.categorie,
                seller_rating: Number(req.body.seller_rating || 0),
                wear_level: Number(req.body.wear_level || 0),
                user_id: userId,
                created_at: new Date()
            };

            const newSale = await this.saleService.createSale(saleData);
            
            res.status(201).json(newSale);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req: Request, res: Response): Promise<void> {
        try {
            const saleId = req.params.id as string;
            const sale = await this.saleService.getSaleById(saleId);
            res.status(200).json(sale);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response): Promise<void> {
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({ error: "Aucune donnée à mettre à jour." });
            return;
        }

        try {
            const userId = getUserId(req);
            const saleId = req.params.id as string;
            
            const validatedData = updateSaleSchema.parse(req.body);
            
            if (validatedData.categorie && !CATEGORIES_VALIDEES.includes(validatedData.categorie)) {
                res.status(400).json({ error: "Catégorie invalide." });
                return;
            }

            const cleanData = Object.fromEntries(
                Object.entries(validatedData).filter(([_, value]) => value !== undefined)
            ) as Partial<Sale>;
            
            const updatedSale = await this.saleService.updateSale(saleId, userId, cleanData);
            res.status(200).json(updatedSale);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues.map(e => e.message).join(' | ') });
                return;
            }
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = getUserId(req);
            const saleId = req.params.id as string;
            
            await this.saleService.deleteSale(saleId, userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
