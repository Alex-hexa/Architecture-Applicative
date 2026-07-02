import { SaleRepository, type SaleFilters } from '../repository/SaleRepository.js';
import type { Sale } from '../models/SaleModel.js';

export class SaleService {
    constructor(private readonly saleRepository: SaleRepository) {}

    async getSales(filters: SaleFilters): Promise<Sale[]> {
        return this.saleRepository.findAll(filters);
    }
}