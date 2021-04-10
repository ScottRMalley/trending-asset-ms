'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("SELECT create_hypertable('asset_searches', 'time');");
  },

  down: async (queryInterface, Sequelize) => {
  }
};
