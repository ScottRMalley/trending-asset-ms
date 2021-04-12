'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX user_id_log_time ON asset_searches (user_id, log_time DESC)');
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.sequelize.query('DROP INDEX user_id_log_time');
  }
};
