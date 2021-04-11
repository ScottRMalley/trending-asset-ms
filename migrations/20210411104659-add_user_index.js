'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX user_time ON asset_searches ("user", "time" DESC)');
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.sequelize.query('DROP INDEX user_time');
  }
};
