import type { Sale } from '../models/SaleModel.js';
import type { Preference } from '../models/PreferenceModel.js';
import { getSalesBounds, getSalesRanges, getNormMax, applyWeightedScores, applyBarycenterScores } from './helper/ScoringHelper.js';

export interface SaleWithScore extends Sale {
    score: number;
}

export interface ScoringStrategy {
    score(sales: Sale[], userPreferences?: Preference[]): SaleWithScore[];
}

export class WeightedScoringStrategy implements ScoringStrategy {
    constructor(
        private readonly weightPrice: number = 3,
        private readonly weightSellerRating: number = 2,
        private readonly weightWearLevel: number = 2,
        private readonly weightQuantity: number = 1
    ) {}

    // Pondérée : O(n log n)
    score(sales: Sale[]): SaleWithScore[] {
        const bounds = getSalesBounds(sales);
        if (!bounds) return [];

        const ranges = getSalesRanges(bounds);
        const weights = {
            price: this.weightPrice,
            sellerRating: this.weightSellerRating,
            wearLevel: this.weightWearLevel,
            quantity: this.weightQuantity
        };

        const scoredSales = applyWeightedScores(sales, bounds, ranges, weights);
        
        return scoredSales.sort((a, b) => b.score - a.score);
    }
}

export class BarycenterScoringStrategy implements ScoringStrategy {
    // Barycentre: O(n log n)
    score(sales: Sale[], userPreferences: Preference[] = []): SaleWithScore[] {
        const bounds = getSalesBounds(sales);
        if (!bounds) return [];

        if (userPreferences.length === 0) {
            return sales.map(sale => ({ ...sale, score: 0 }));
        }

        const preferenceMap = new Map<string, Preference>();
        let sumNormPrice = 0, sumNormQty = 0, sumNormRating = 0, sumNormWear = 0;
        let validFavoritesCount = 0;

        for (const pref of userPreferences) {
            preferenceMap.set(pref.sale_id, pref);
            if (pref.sale) {
                sumNormPrice += getNormMax(pref.sale.price, bounds.minPrice, bounds.maxPrice);
                sumNormQty += getNormMax(pref.sale.quantity, bounds.minQty, bounds.maxQty);
                sumNormRating += getNormMax(pref.sale.seller_rating, bounds.minRating, bounds.maxRating);
                sumNormWear += getNormMax(pref.sale.wear_level, bounds.minWear, bounds.maxWear);
                validFavoritesCount++;
            }
        }

        const barycenter = {
            price: sumNormPrice / validFavoritesCount,
            qty: sumNormQty / validFavoritesCount,
            rating: sumNormRating / validFavoritesCount,
            wear: sumNormWear / validFavoritesCount
        };

        const scoredSales = applyBarycenterScores(sales, bounds, barycenter);

        return scoredSales.sort((a, b) => b.score - a.score);
    }
}