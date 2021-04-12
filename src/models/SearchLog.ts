import {Model, Sequelize, DataTypes} from "sequelize";

class SearchLog extends Model {
    public time!: Date;
    public asset!: number;
    public user!: number;
}

const initModels = (sequelize: Sequelize): Model => {
    const attributes = {
        logTime: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'log_time',
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
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
