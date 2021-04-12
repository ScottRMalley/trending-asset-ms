'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asset_searches', {
      logTime: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'log_time',
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id',
        primaryKey: true,
      },
      asset: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('asset_searches');
  }
};