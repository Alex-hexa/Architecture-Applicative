import type { Sale } from '../models/SaleModel.js';
import type { Preference } from '../models/PreferenceModel.js';

export interface SaleWithScore extends Sale {
    score: number;
}

export interface ScoringStrategy {
    score(sales: Sale[], userPreferences?: Preference[]): SaleWithScore[];
}

// 1. Singleton
export class ScoringConfig {
    private static instance: ScoringConfig;
    public weightPrice = 3;
    public weightSellerRating = 2;
    public weightWearLevel = 2;
    public weightQuantity = 1;

    private constructor() {}

    static get(): ScoringConfig {
        if (!ScoringConfig.instance) {
            ScoringConfig.instance = new ScoringConfig();
        }
        return ScoringConfig.instance;
    }
}

// 2. Factory
export class ScoringStrategyFactory {
    static create(type: 'barycenter' | 'weighted'): ScoringStrategy {
        switch (type) {
            case "barycenter":
                return new BarycenterScoringStrategy();
            case "weighted":
                const config = ScoringConfig.get();
                return new WeightedScoringStrategy(
                    config.weightPrice,
                    config.weightSellerRating,
                    config.weightWearLevel,
                    config.weightQuantity
                );
            default:
                throw new Error("Type de stratégie de tri invalide");
        }
    }
}

export class WeightedScoringStrategy implements ScoringStrategy {
    constructor(
        private readonly weightPrice: number = 3,
        private readonly weightSellerRating: number = 2,
        private readonly weightWearLevel: number = 2,
        private readonly weightQuantity: number = 1
    ) {}

    // Pondérée : O(n log n)
    score(sales: Sale[], userPreferences?: Preference[]): SaleWithScore[] {
        if (sales.length === 0) return [];
        let minPrice = Infinity, maxPrice = -Infinity;
        let minQty = Infinity, maxQty = -Infinity;
        let minRating = Infinity, maxRating = -Infinity;
        let minWear = Infinity, maxWear = -Infinity;
        
        for (const sale of sales) {
            if (sale.price < minPrice) minPrice = sale.price;
            if (sale.price > maxPrice) maxPrice = sale.price;
            if (sale.quantity < minQty) minQty = sale.quantity;
            if (sale.quantity > maxQty) maxQty = sale.quantity;
            if (sale.seller_rating < minRating) minRating = sale.seller_rating;
            if (sale.seller_rating > maxRating) maxRating = sale.seller_rating;
            if (sale.wear_level < minWear) minWear = sale.wear_level;
            if (sale.wear_level > maxWear) maxWear = sale.wear_level;
        }
        
        const priceRange = maxPrice - minPrice || 1;
        const qtyRange = maxQty - minQty || 1;
        const ratingRange = maxRating - minRating || 1;
        const wearRange = maxWear - minWear || 1;

        const scoredSales = sales.map(sale => {
            const normPrice = (maxPrice - sale.price) / priceRange;
            const normWear = (maxWear - sale.wear_level) / wearRange;
            const normQty = (sale.quantity - minQty) / qtyRange;
            const normRating = (sale.seller_rating - minRating) / ratingRange;

            const finalScore = (normPrice * this.weightPrice) + 
                               (normQty * this.weightQuantity) +
                               (normRating * this.weightSellerRating) +
                               (normWear * this.weightWearLevel);
            return { ...sale, score: finalScore };
        });
        
        return scoredSales.sort((a, b) => b.score - a.score);
    }
}

export class BarycenterScoringStrategy implements ScoringStrategy {
    // Barycentre: O(n log n)
    score(sales: Sale[], userPreferences: Preference[] = []): SaleWithScore[] {
        if (sales.length === 0) return [];
        
        let minPrice = Infinity, maxPrice = -Infinity;
        let minQty = Infinity, maxQty = -Infinity;
        let minRating = Infinity, maxRating = -Infinity;
        let minWear = Infinity, maxWear = -Infinity;

        for (const sale of sales) {
            if (sale.price < minPrice) minPrice = sale.price;
            if (sale.price > maxPrice) maxPrice = sale.price;
            if (sale.quantity < minQty) minQty = sale.quantity;
            if (sale.quantity > maxQty) maxQty = sale.quantity;
            if (sale.seller_rating < minRating) minRating = sale.seller_rating;
            if (sale.seller_rating > maxRating) maxRating = sale.seller_rating;
            if (sale.wear_level < minWear) minWear = sale.wear_level;
            if (sale.wear_level > maxWear) maxWear = sale.wear_level;
        }

        if (userPreferences.length === 0) {
            return sales.map(sale => ({ ...sale, score: 0 }));
        }

        const getNorm = (val: number, min: number, max: number) => {
            if (max === min) return 0; 
            return (val - min) / (max - min);
        };

        // 3. Accès direct O(1)
        const preferenceMap = new Map<string, Preference>();
        
        let sumNormPrice = 0, sumNormQty = 0, sumNormRating = 0, sumNormWear = 0;
        let validFavoritesCount = 0;

        // 4. Boucles côte à côte O(n+m)
        for (const pref of userPreferences) {
            preferenceMap.set(pref.sale_id, pref);
            
            if (pref.sale) {
                sumNormPrice += getNorm(pref.sale.price, minPrice, maxPrice);
                sumNormQty += getNorm(pref.sale.quantity, minQty, maxQty);
                sumNormRating += getNorm(pref.sale.seller_rating, minRating, maxRating);
                sumNormWear += getNorm(pref.sale.wear_level, minWear, maxWear);
                validFavoritesCount++;
            }
        }

        if (validFavoritesCount === 0) {
            return sales.map(sale => ({ ...sale, score: 0 }));
        }

        const barycenter = {
            price: sumNormPrice / validFavoritesCount,
            qty: sumNormQty / validFavoritesCount,
            rating: sumNormRating / validFavoritesCount,
            wear: sumNormWear / validFavoritesCount
        };

        const scoredSales = sales.map(sale => {
            const normPrice = getNorm(sale.price, minPrice, maxPrice);
            const normQty = getNorm(sale.quantity, minQty, maxQty);
            const normRating = getNorm(sale.seller_rating, minRating, maxRating);
            const normWear = getNorm(sale.wear_level, minWear, maxWear);

            const distance = Math.sqrt(
                Math.pow(normPrice - barycenter.price, 2) +
                Math.pow(normQty - barycenter.qty, 2) +
                Math.pow(normRating - barycenter.rating, 2) +
                Math.pow(normWear - barycenter.wear, 2)
            );
            
            let score = 100 / (1 + distance);
            
            // Démonstration de l'accès direct O(1)
            if (preferenceMap.has(sale.id)) {
                score += 5;
            }
            
            return { ...sale, score };
        });

        return scoredSales.sort((a, b) => b.score - a.score);
    }
}