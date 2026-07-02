import type { Request, Response } from 'express';
import { SaleService } from '../service/SaleService.js';
import type { SaleFilters } from '../repository/SaleRepository.js';

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
}