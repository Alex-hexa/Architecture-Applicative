import type { Sale } from '../models/SaleModel.js';
import type { Preference } from '../models/PreferenceModel.js';

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

    // Scoring Pondéré - O(n*log(n)) à cause du tri, mais O(n) pour le calcul des scores.
    // Meilleur offre
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

    // Le Barycentre sémantique - O(n*log(n)) pour le tri, O(n) pour le calcul.
    // Selon les préférences de l'utilisateur
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

        const priceRange = maxPrice - minPrice || 1;
        const qtyRange = maxQty - minQty || 1;
        const ratingRange = maxRating - minRating || 1;
        const wearRange = maxWear - minWear || 1;

        let userIdeal = { price: 0, qty: 0, rating: 0, wear: 0 };
        let categorieDominante = "";
        
        if (userPreferences.length > 0) {
            let sumPrice = 0, sumQty = 0, sumRating = 0, sumWear = 0;
            let totalWeight = 0; 
            
            const categoryScores: Record<string, number> = {};
            
            for (const pref of userPreferences) {
                if (pref.sale) {
                    const weight = pref.score > 0 ? pref.score : 1; 

                    sumPrice += pref.sale.price * weight;
                    sumQty += pref.sale.quantity * weight;
                    sumRating += pref.sale.seller_rating * weight;
                    sumWear += pref.sale.wear_level * weight;
                    totalWeight += weight;
                    
                    const cat = pref.sale.categorie;
                    categoryScores[cat] = (categoryScores[cat] || 0) + weight;
                }
            }
            
            if (totalWeight > 0) {
                userIdeal = {
                    price: sumPrice / totalWeight,
                    qty: sumQty / totalWeight,
                    rating: sumRating / totalWeight,
                    wear: sumWear / totalWeight
                };
                
                let maxCatScore = 0;
                for (const cat in categoryScores) {
                    const catScore = categoryScores[cat] ?? 0;
                    
                    if (catScore > maxCatScore) {
                        maxCatScore = catScore;
                        categorieDominante = cat;
                    }
                }
            } else {
                return sales.map(sale => ({ ...sale, score: 0 }));
            }
        } else {
            return sales.map(sale => ({ ...sale, score: 0 })); 
        }

        const scoredSales = sales.map(sale => {
            const normSalePrice = (sale.price - minPrice) / priceRange;
            const normUserPrice = (userIdeal.price - minPrice) / priceRange;
            
            const normSaleQty = (sale.quantity - minQty) / qtyRange;
            const normUserQty = (userIdeal.qty - minQty) / qtyRange;
            
            const normSaleRating = (sale.seller_rating - minRating) / ratingRange;
            const normUserRating = (userIdeal.rating - minRating) / ratingRange;
            
            const normSaleWear = (sale.wear_level - minWear) / wearRange;
            const normUserWear = (userIdeal.wear - minWear) / wearRange;

            const distance = Math.sqrt(
                Math.pow(normSalePrice - normUserPrice, 2) +
                Math.pow(normSaleQty - normUserQty, 2) +
                Math.pow(normSaleRating - normUserRating, 2) +
                Math.pow(normSaleWear - normUserWear, 2)
            );
            
            let similarityScore = 100 / (1 + distance);

            if (categorieDominante && sale.categorie === categorieDominante) {
                similarityScore += 50; 
            }
            
            return { ...sale, score: similarityScore };
        });
        
        return scoredSales.sort((a, b) => b.score - a.score);
    }
}