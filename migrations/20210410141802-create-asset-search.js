'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asset_searches', {
      time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      user: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      asset: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('asset_searches');
  }
};