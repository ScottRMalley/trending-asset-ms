import {Model, Sequelize, DataTypes} from "sequelize";

class SearchLog extends Model {
    public time!: Date;
    public asset!: number;
    public user!: number;
}

const initModels = (sequelize: Sequelize): Model => {
    const attributes = {
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
    };
    return SearchLog.init(attributes, {tableName: 'asset_searches', timestamps: false, sequelize});
};

export {SearchLog, initModels};
