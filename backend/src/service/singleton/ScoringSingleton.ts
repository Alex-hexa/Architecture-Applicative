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