import {Sequelize} from "sequelize";
import {initModels, SearchLog} from "./models/SearchLog";

export interface TrendingSearchesResponse {
    assetIds: number[];
}

export interface RecentSearchesResponse {
    assetIds: number[];
}

interface Search {
    logSearch(userId: number, assetId: number): Promise<void>;

    getTrendingSearches(): Promise<TrendingSearchesResponse>;

    getRecentSearches(userId: number): Promise<RecentSearchesResponse>;
}

export class AssetSearch implements Search {
    private sequelize: Sequelize;

    constructor(sequelize: Sequelize) {
        initModels(sequelize);
        this.sequelize = sequelize;
    }

    async logSearch(userId: number, assetId: number): Promise<void> {
        await SearchLog.create({
            time: Sequelize.fn('NOW'),
            user: userId,
            asset: assetId,
        });
    }

    async getTrendingSearches(): Promise<TrendingSearchesResponse> {
        const [assets, metadata] = await this.sequelize.query(`
            SELECT asset, COUNT(DISTINCT "user")
            FROM asset_searches
            WHERE "time" BETWEEN NOW() - INTERVAL '24 h' AND NOW()
            GROUP BY asset
            ORDER BY count desc
            LIMIT 100;
        `);
        return {assetIds: assets.map((result: any) => result.asset)};
    }

    async getRecentSearches(userId: number): Promise<RecentSearchesResponse> {
        const [assets, metadata] = await this.sequelize.query(`
            SELECT DISTINCT(asset), MAX("time")
            FROM asset_searches
            WHERE "user" = ${userId}
            GROUP BY asset
            ORDER BY 2 DESC
            LIMIT 100;
        `);
        return {assetIds: assets.map((result: any) => result.asset)}
    }
}
