'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class asset_search extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  asset_search.init({
    time: DataTypes.DATE,
    user: DataTypes.INTEGER,
    asset: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'asset_search',
  });
  return asset_search;
};