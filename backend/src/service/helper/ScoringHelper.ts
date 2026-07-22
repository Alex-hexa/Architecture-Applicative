import type { Sale } from '../../models/SaleModel.js';

export interface SalesBounds {
    minPrice: number; maxPrice: number;
    minQty: number; maxQty: number;
    minRating: number; maxRating: number;
    minWear: number; maxWear: number;
}

export const getNormMin = (val: number, min: number, max: number) => {
    if (max === min) return 0; 
    return (max - val) / (max - min);
};

export const getNormMax = (val: number, min: number, max: number) => {
    if (max === min) return 0; 
    return (val - min) / (max - min);
};

export const getSalesBounds = (sales: Sale[]) => {
    if (sales.length === 0) return null;
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
    
    return { minPrice, maxPrice, minQty, maxQty, minRating, maxRating, minWear, maxWear };
};

export const getSalesRanges = (bounds: ReturnType<typeof getSalesBounds>) => {
    if (!bounds) return null;
    return {
        priceRange: bounds.maxPrice - bounds.minPrice || 1,
        qtyRange: bounds.maxQty - bounds.minQty || 1,
        ratingRange: bounds.maxRating - bounds.minRating || 1,
        wearRange: bounds.maxWear - bounds.minWear || 1
    };
};

export const applyWeightedScores = (sales: Sale[], bounds: SalesBounds, ranges: any, weights: any) => {
    return sales.map(sale => {
        const normPrice = (bounds.maxPrice - sale.price) / ranges.priceRange;
        const normWear = (bounds.maxWear - sale.wear_level) / ranges.wearRange;
        const normQty = (sale.quantity - bounds.minQty) / ranges.qtyRange;
        const normRating = (sale.seller_rating - bounds.minRating) / ranges.ratingRange;

        const finalScore = (normPrice * weights.price) + 
                           (normQty * weights.quantity) +
                           (normRating * weights.sellerRating) +
                           (normWear * weights.wearLevel);
                           
        return { ...sale, score: finalScore };
    });
};

export const applyBarycenterScores = (sales: Sale[], bounds: any, barycenter: any) => {
    return sales.map(sale => {
        const normPrice = getNormMax(sale.price, bounds.minPrice, bounds.maxPrice);
        const normQty = getNormMax(sale.quantity, bounds.minQty, bounds.maxQty);
        const normRating = getNormMax(sale.seller_rating, bounds.minRating, bounds.maxRating);
        const normWear = getNormMax(sale.wear_level, bounds.minWear, bounds.maxWear);

        const distance = Math.sqrt(
            Math.pow(normPrice - barycenter.price, 2) +
            Math.pow(normQty - barycenter.qty, 2) +
            Math.pow(normRating - barycenter.rating, 2) +
            Math.pow(normWear - barycenter.wear, 2)
        );
        
        let score = 100 / (1 + distance);
        
        return { ...sale, score };
    });
};