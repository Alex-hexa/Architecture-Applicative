import type { ScoringStrategy } from '../ScoringService.js';
import { BarycenterScoringStrategy, WeightedScoringStrategy } from '../ScoringService.js';
import { ScoringConfig } from '../singleton/ScoringSingleton.js';

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