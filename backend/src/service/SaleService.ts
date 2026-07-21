import { SaleRepository, type SaleFilters } from '../repository/SaleRepository.js';
import type { Sale } from '../models/SaleModel.js';
import type { ScoringStrategy } from './ScoringStrategies.js';
import type { Preference } from '../models/PreferenceModel.js';

export class SaleService {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly scoringStrategy: ScoringStrategy 
    ) {}

    async getSales(filters: SaleFilters, userPreferences: Preference[] = []): Promise<Sale[]> {
        const sales = await this.saleRepository.findAll(filters);
        return this.scoringStrategy.score(sales, userPreferences);
    }

    async getSaleById(id: string): Promise<Sale> {
        const sale = await this.saleRepository.findById(id);
        if (!sale) {
            throw new Error("Annonce introuvable.");
        }
        return sale;
    }

    async updateSale(id: string, userId: string, updateData: Partial<Sale>): Promise<Sale> {
        return this.saleRepository.update(id, userId, updateData);
    }

    async deleteSale(id: string, userId: string): Promise<void> {
        await this.saleRepository.delete(id, userId);
    }

    async createSale(saleData: Omit<Sale, 'id'>): Promise<Sale> {
        return this.saleRepository.create(saleData);
    }
}