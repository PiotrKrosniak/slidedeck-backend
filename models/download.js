'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Download extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Download.init({
    download_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    asset_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    download_time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Download',
  });
  return Download;
};