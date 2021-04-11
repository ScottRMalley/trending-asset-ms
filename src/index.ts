import express from 'express';
import {Sequelize, DataTypes} from 'sequelize';
import dotenv from 'dotenv';
import {AssetSearch, RecentSearchesResponse, TrendingSearchesResponse} from "./search";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded());
const port = 8080;

const sequelize: Sequelize = new Sequelize(
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/trending_asset_ms`,
    {
        dialect: 'postgres',
        protocol: 'postgres'
    }
);

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

const search: AssetSearch = new AssetSearch(sequelize);

app.post('/log', async (req, res) => {
    const {userId, assetId} = req.body;
    try {
        await search.logSearch(userId, assetId);
        return res.status(200).send();
    } catch (err) {
        console.error('Could not save search');
        return res.status(500).send();
    }
});

app.get('/trending', async (req, res) => {
    try {
        const trendingSearchesResponse: TrendingSearchesResponse = await search.getTrendingSearches();
        return res.status(200).send(trendingSearchesResponse);
    } catch (err) {
        console.error('Could not retrieve trending assets.');
        return res.status(500).send({message: 'Could not retrieve trending assets'})
    }

});

app.get('/user/:id/recent', async (req, res) => {
    const {id} = req.params;
    let userId: number;
    let num = Number(id);
    if (!isNaN(num)) {
        userId = Number(req.params.id);
    } else {
        return res.status(400).send({message: "Invalid userId. Must be a number"})
    }
    try {
        const recentSearchesResponse: RecentSearchesResponse = await search.getRecentSearches(userId);
        return res.status(200).send(recentSearchesResponse);
    } catch (err) {
        console.error('Could not retrieve trending assets.');
        return res.status(500).send({message: 'Could not retrieve recent asset searches.'});
    }
});

app.listen(port, () => {
    console.log(`trending-asset-ms listening at http://localhost:${port}`)
});
