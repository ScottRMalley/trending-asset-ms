import {RedisClient} from "redis";
import {promisify} from "util";

export class SearchCache {
    private readonly getAsync: any;
    private readonly getSetMembers: any;
    private readonly scanAsync: any;
    private readonly getKeysAsync: any;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient) {
        this.getAsync = promisify(redisClient.get).bind(redisClient);
        this.getSetMembers = promisify(redisClient.smembers).bind(redisClient);
        this.scanAsync = promisify(redisClient.scan).bind(redisClient);
        this.getKeysAsync = promisify(redisClient.keys).bind(redisClient);
        this.redisClient = redisClient;
    }

    logAssetSearch(assetId: number, userId: number): Promise<void> {
        this.redisClient.sadd('assets', String(assetId));
        return this.setAsync(`${assetId}:${userId}`, new Date().toUTCString(), 60 * 60 * 24);
    }

    async getTrending(): Promise<number[]> {
        const keys = await this.getKeysAsync("*");
        const assetCounts: { [assetId: string]: number } = {};
        keys.forEach((key: string) => {
            const asset: string = key.split(':')[0];
            if (!assetCounts[asset]) {
                assetCounts[asset] = 1;
            } else {
                assetCounts[asset]++;
            }
        });

        return Object.entries(assetCounts).sort((a, b) => b[1] - a[1])
            .slice(0, 100)
            .map((assetCount) => Number(assetCount[0]));
    }

    setAsync(key: string, value: string, expire: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.set(key, value, 'EX', expire, ((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            }))
        });
    }
}