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

    async createSale(saleData: Omit<Sale, 'id'>): Promise<Sale> {
        return this.saleRepository.create(saleData);
    }
}