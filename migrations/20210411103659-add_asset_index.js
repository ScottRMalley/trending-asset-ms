'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX asset_log_time ON asset_searches (asset, log_time DESC)');
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.sequelize.query('DROP INDEX asset_log_time');
  }
};
