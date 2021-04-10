import express from 'express';
import {Sequelize, DataTypes} from 'sequelize';

const app = express();
app.use(express.json());
app.use(express.urlencoded());
const port = 8080;

const db = new Sequelize(
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/trending_asset_ms`,
    {
      dialect: 'postgres',
      protocol: 'postgres'
    }
);

db.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

const AssetSearch = db.define('asset_search', {
  time: {
    type: DataTypes.DATE,
    primaryKey: true,
  },
  user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  asset: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {tableName: 'asset_searches', timestamps: false});

app.post('/log', async (req, res) => {
  const {userId, assetId} = req.body;
  try {
    await AssetSearch.create({
      time: db.fn('NOW'),
      user: userId,
      asset: assetId,
    });
    return res.status(200).send();
  } catch (err) {
    console.error('Could not save search');
    return res.status(500).send();
  }
});

app.get('/trending', async (req, res) => {
  try {
    const [assets, metadata] = await db.query(`
        SELECT asset, COUNT(DISTINCT "user")
        FROM asset_searches
        WHERE "time" BETWEEN NOW() - INTERVAL '24 h' AND NOW()
        GROUP BY asset
        ORDER BY count desc
        LIMIT 100;
    `);
    return res.status(200).send({assetIds: assets.map(({asset}) => asset)});
  } catch (err) {
    console.error('Could not retrieve trending assets.');
    return res.status(500).send({message: 'Could not retrieve trending assets'})
  }

});

app.get('/user/:id/recent', async (req, res) => {
  const {id} = req.params;
  try {
    const [assets, metadata] = await db.query(`
        SELECT DISTINCT(asset), MAX("time")
        FROM asset_searches
        WHERE "user" = 1
        GROUP BY asset
        ORDER BY 2 DESC
        LIMIT 100;
    `);
    return res.status(200).send({assetIds: assets.map(({asset}) => asset)});
  } catch (err) {
    console.error('Could not retrieve trending assets.');
    return res.status(500).send({message: 'Could not retrieve recent asset searches.'});
  }
});

app.listen(port, () => {
  console.log(`trending-asset-ms listening at http://localhost:${port}`)
});
